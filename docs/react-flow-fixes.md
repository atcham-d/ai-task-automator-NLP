# React Flow Architecture & Fixes

This document serves as a centralized reference for the architectural decisions and recent bug fixes applied to the `WorkflowBuilder` React Flow component.

## 1. Custom Node Types

We defined three custom node types to represent the core building blocks of our workflows:

- **TriggerNode:** Receives the initial event. Rendered with a purple background. Supports a single `source` handle (at the bottom).
- **ConditionNode:** Evaluates data. Rendered with an amber/yellow background. Supports a `target` handle (at the top) and two `source` handles: a green "yes" handle and a red "no" handle.
- **ActionNode:** Executes a task. Rendered with an indigo background. Supports a single `target` handle (at the top).

These custom components are registered in `WorkflowBuilder.tsx` using `useMemo`:

```tsx
const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    condition: ConditionNode,
    action: ActionNode,
}), []);
```

## 2. Dynamic Parsing and Node Generation

When the NLP parser returns a `WorkflowDefinition` JSON object, the `definitionToNodes` helper converts this abstract representation into physical XY layout coordinates:

1. **Trigger:** Always placed at the top (`x: 250, y: 50`).
2. **Conditions:** Placed sequentially beneath the trigger. Nodes are vertically spaced by `160px`.
3. **Actions:** Placed at the bottom. If multiple actions exist (e.g., branched logic after a condition), they are spread out horizontally using an `actionSpacing` of `270px`.

### Edge Wiring Logic
- Edges automatically connect `trigger -> condition`.
- For condition branching, the first action connects precisely to the `yes` source handle, and the second action connects to the `no` source handle:
  ```ts
  sourceHandle: def.conditions.length > 0 && i === 0 ? 'yes' : def.conditions.length > 0 && i === 1 ? 'no' : undefined,
  ```

## 3. Recent Component Fixes

During recent iterations, several key fixes were applied to stabilize the React Flow component:

1. **Z-Index Handle Fix:** Custom handles (especially the `yes`/`no` condition handles) were unclickable. This was fixed by adding `zIndex: 10` to the handle styles to elevate them above the node body.
2. **Missing Handle ID Error:** The React Flow strict mode error _"couldn't create edge... handle null not found"_ was fixed by ensuring that `ConditionNode` explicitly defines `id="yes"` and `id="no"` on its handles, and that `definitionToNodes` precisely targets `sourceHandle: 'yes' | 'no'`.
3. **Animated Edges Migration:** The standard `animated: true` edge type was replaced with a custom `<AnimatedEdge />` component to support more complex multi-path stroke dash animations, giving the effect of data flowing through the pipes.

## 4. State Management (useNodesState vs state props)

The application moved from controlling nodes entirely via a top-level React state object to using React Flow's native `useNodesState` and `useEdgesState`. This resolved a bug where dragging a node wouldn't stick to its new position because the main state wasn't persisting coordinate updates natively.

```tsx
const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
```

Modifying nodes (via NLP parsing) directly calls `setNodes` and `setEdges`, allowing a seamless hybrid of AI-generated layouts and user-dragged manual positioning.
