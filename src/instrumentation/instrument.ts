import generate from '@babel/generator'
import { parse } from '@babel/parser'
import traverse, { type NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import type { InstrumentResult } from '../types'

type TraceNode = t.Node & { __traceInjected?: boolean }

function injected<T extends t.Node>(node: T): T {
  ;(node as TraceNode).__traceInjected = true
  return node
}

function isInjected(node: t.Node): boolean {
  return Boolean((node as TraceNode).__traceInjected)
}

function traceMember(method: string): t.MemberExpression {
  return t.memberExpression(t.identifier('__trace'), t.identifier(method))
}

function traceCall(method: string, args: t.Expression[]): t.CallExpression {
  return t.callExpression(traceMember(method), args)
}

function lineOf(node: t.Node, fallback = 1): number {
  return node.loc?.start.line ?? fallback
}

function isTraceCall(node: t.Node | null | undefined, method?: string): boolean {
  if (!t.isCallExpression(node) || !t.isMemberExpression(node.callee)) return false
  if (!t.isIdentifier(node.callee.object, { name: '__trace' })) return false
  if (!t.isIdentifier(node.callee.property)) return false
  return method ? node.callee.property.name === method : true
}

function wrapCondition(expression: t.Expression, line: number): t.CallExpression {
  const label = generate(expression, { compact: true, comments: false }).code
  return traceCall('branch', [t.stringLiteral(label), expression, t.numericLiteral(line)])
}

function getFunctionName(path: NodePath<t.Function>): string {
  const node = path.node
  if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
    if (node.id?.name) return node.id.name
  }

  const parent = path.parentPath
  if (parent?.isVariableDeclarator() && t.isIdentifier(parent.node.id)) {
    return parent.node.id.name
  }
  if (parent?.isObjectProperty()) {
    if (t.isIdentifier(parent.node.key)) return parent.node.key.name
    if (t.isStringLiteral(parent.node.key)) return parent.node.key.value
  }

  return 'anonymous'
}

function parameterBindings(node: t.Function): string[] {
  const names = new Set<string>()
  for (const parameter of node.params) {
    const bindings = t.getBindingIdentifiers(parameter)
    for (const name of Object.keys(bindings)) names.add(name)
  }
  return [...names]
}

function markStatement(statement: t.Statement): t.Statement {
  return injected(statement)
}

export function instrumentCode(source: string): InstrumentResult {
  const ast = parse(source, {
    sourceType: 'script',
    allowAwaitOutsideFunction: false,
    errorRecovery: false,
    plugins: ['numericSeparator', 'optionalChaining', 'nullishCoalescingOperator'],
  })

  // Concise arrow functions need a block so call/return hooks can be inserted.
  traverse(ast, {
    ArrowFunctionExpression(path) {
      if (!t.isBlockStatement(path.node.body)) {
        path.node.body = t.blockStatement([t.returnStatement(path.node.body)])
      }
    },
  })

  // Capture every decision without changing JavaScript truthiness semantics.
  traverse(ast, {
    IfStatement(path) {
      if (!isTraceCall(path.node.test, 'branch')) {
        path.node.test = wrapCondition(path.node.test, lineOf(path.node))
      }
    },
    WhileStatement(path) {
      if (!isTraceCall(path.node.test, 'branch')) {
        path.node.test = wrapCondition(path.node.test, lineOf(path.node))
      }
    },
    DoWhileStatement(path) {
      if (!isTraceCall(path.node.test, 'branch')) {
        path.node.test = wrapCondition(path.node.test, lineOf(path.node))
      }
    },
    ForStatement(path) {
      if (path.node.test && !isTraceCall(path.node.test, 'branch')) {
        path.node.test = wrapCondition(path.node.test, lineOf(path.node))
      }
    },
    ConditionalExpression(path) {
      if (!isTraceCall(path.node.test, 'branch')) {
        path.node.test = wrapCondition(path.node.test, lineOf(path.node))
      }
    },
  })

  // Runtime track() only proxies objects, so wrapping scalar declarations is harmless.
  // Doing this broadly means user-defined names work without annotations.
  traverse(ast, {
    VariableDeclarator(path) {
      if (!t.isIdentifier(path.node.id) || !path.node.init) return
      if (isTraceCall(path.node.init, 'track')) return

      path.node.init = traceCall('track', [
        t.stringLiteral(path.node.id.name),
        path.node.init as t.Expression,
        t.numericLiteral(lineOf(path.node)),
      ])
    },
  })

  // Function exit order instruments nested functions before their parents.
  traverse(ast, {
    Function: {
      exit(path) {
        if (!t.isBlockStatement(path.node.body)) return

        const name = getFunctionName(path)
        const functionLine = lineOf(path.node)
        const callId = path.scope.generateUidIdentifier('traceCallId')
        const bindings = parameterBindings(path.node)
        const bodyPath = path.get('body') as NodePath<t.BlockStatement>

        bodyPath.traverse({
          Function(innerPath) {
            innerPath.skip()
          },
          ReturnStatement(returnPath) {
            if (isInjected(returnPath.node)) return
            const returnLine = lineOf(returnPath.node, functionLine)
            const value = returnPath.node.argument ?? t.identifier('undefined')
            returnPath.node.argument = traceCall('ret', [
              t.stringLiteral(name),
              value,
              t.numericLiteral(returnLine),
              t.cloneNode(callId),
            ])
          },
        })

        const argsObject = t.objectExpression(
          bindings.map((binding) =>
            t.objectProperty(t.identifier(binding), t.identifier(binding), false, true),
          ),
        )

        const callDeclaration = markStatement(
          t.variableDeclaration('const', [
            t.variableDeclarator(
              t.cloneNode(callId),
              traceCall('call', [
                t.stringLiteral(name),
                argsObject,
                t.numericLiteral(functionLine),
              ]),
            ),
          ]),
        )

        const parameterTrackers = bindings.map((binding) =>
          markStatement(
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.identifier(binding),
                traceCall('track', [
                  t.stringLiteral(binding),
                  t.identifier(binding),
                  t.numericLiteral(functionLine),
                ]),
              ),
            ),
          ),
        )

        const fallthroughReturn = markStatement(
          t.returnStatement(
            traceCall('ret', [
              t.stringLiteral(name),
              t.identifier('undefined'),
              t.numericLiteral(path.node.loc?.end.line ?? functionLine),
              t.cloneNode(callId),
            ]),
          ),
        )

        path.node.body.body.unshift(callDeclaration, ...parameterTrackers)
        path.node.body.body.push(fallthroughReturn)
      },
    },
  })

  // Insert line ticks only where a statement belongs to a statement list. Reads and
  // writes also carry the current line, while compact single-line branches use their
  // explicit branch/return line numbers.
  traverse(ast, {
    Statement(path) {
      if (isInjected(path.node) || !path.node.loc) return
      if (
        path.isBlockStatement() ||
        path.isEmptyStatement() ||
        path.isFunctionDeclaration()
      ) {
        return
      }

      const parent = path.parentPath
      if (!parent) return
      const belongsToList =
        parent.isProgram() || parent.isBlockStatement() || parent.isSwitchCase()
      if (!belongsToList) return

      const tick = markStatement(
        t.expressionStatement(
          traceCall('line', [t.numericLiteral(lineOf(path.node))]),
        ),
      )
      path.insertBefore(tick)
    },
  })

  const output = generate(ast, {
    comments: true,
    compact: false,
    retainLines: true,
  })

  return { code: output.code }
}
