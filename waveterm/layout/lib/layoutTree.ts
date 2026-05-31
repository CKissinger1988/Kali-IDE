// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { lazy } from "@/util/util";
import {
    addChildAt,
    addIntermediateNode,
    findInsertLocationFromIndexArr,
    findNextInsertLocation,
    findNode,
    findParent,
    removeChild,
} from "./layoutNode";
import {
    DefaultNodeSize,
    DropDirection,
    FlexDirection,
    LayoutTreeActionType,
    LayoutTreeComputeMoveNodeAction,
    LayoutTreeDeleteNodeAction,
    LayoutTreeFocusNodeAction,
    LayoutTreeInsertNodeAction,
    LayoutTreeInsertNodeAtIndexAction,
    LayoutTreeMagnifyNodeToggleAction,
    LayoutTreeMoveNodeAction,
    LayoutTreeResizeNodeAction,
    LayoutTreeState,
    LayoutTreeSwapNodeAction,
    MoveOperation,
} from "./types";

import { newLayoutNode } from "./layoutNode";
import { LayoutTreeReplaceNodeAction, LayoutTreeSplitHorizontalAction, LayoutTreeSplitVerticalAction } from "./types";

export const DEFAULT_MAX_CHILDREN = 5;

/**
 * Computes an operation for inserting a new node into the tree in the given direction relative to the specified node.
 *
 * @param layoutState The state of the tree.
 * @param computeInsertAction The operation to compute.
 */
export function computeMoveNode(layoutState: LayoutTreeState, computeInsertAction: LayoutTreeComputeMoveNodeAction) {
    const rootNode = layoutState.rootNode;
    const { nodeId, nodeToMoveId, direction } = computeInsertAction;
    if (!nodeId || !nodeToMoveId) {
        
        return;
    }
    if (direction === undefined) {
        
        return;
    }

    if (nodeId === nodeToMoveId) {
        
        return;
    }

    let newMoveOperation: MoveOperation;
    const parent = lazy(() => findParent(rootNode, nodeId));
    const grandparent = lazy(() => findParent(rootNode, parent().id));
    const indexInParent = lazy(() => parent()?.children.findIndex((child) => nodeId === child.id));
    const indexInGrandparent = lazy(() => grandparent()?.children.findIndex((child) => parent().id === child.id));
    const nodeToMoveParent = lazy(() => findParent(rootNode, nodeToMoveId));
    const nodeToMoveIndexInParent = lazy(() =>
        nodeToMoveParent()?.children.findIndex((child) => nodeToMoveId === child.id)
    );
    const isRoot = rootNode.id === nodeId;

    
    const node = findNode(rootNode, nodeId);
    const nodeToMove = findNode(rootNode, nodeToMoveId);

    if (!node || !nodeToMove) {
        
        return;
    }

    switch (direction) {
        case DropDirection.OuterTop:
            if (node.flexDirection === FlexDirection.Column) {
                const grandparentNode = grandparent();
                if (grandparentNode) {
                    const index = indexInGrandparent();
                    newMoveOperation = {
                        parentId: grandparentNode.id,
                        node: nodeToMove,
                        index,
                    };
                    break;
                }
            }
        // falls through
        case DropDirection.Top:
            if (node.flexDirection === FlexDirection.Column) {
                newMoveOperation = { parentId: nodeId, index: 0, node: nodeToMove };
            } else {
                if (isRoot)
                    newMoveOperation = {
                        node: nodeToMove,
                        index: 0,
                        insertAtRoot: true,
                    };

                const parentNode = parent();
                if (parentNode)
                    newMoveOperation = {
                        parentId: parentNode.id,
                        index: indexInParent() ?? 0,
                        node: nodeToMove,
                    };
            }
            break;
        case DropDirection.OuterBottom:
            if (node.flexDirection === FlexDirection.Column) {
                const grandparentNode = grandparent();
                if (grandparentNode) {
                    const index = indexInGrandparent() + 1;
                    newMoveOperation = {
                        parentId: grandparentNode.id,
                        node: nodeToMove,
                        index,
                    };
                    break;
                }
            }
        // falls through
        case DropDirection.Bottom:
            if (node.flexDirection === FlexDirection.Column) {
                newMoveOperation = { parentId: nodeId, index: 1, node: nodeToMove };
            } else {
                if (isRoot)
                    newMoveOperation = {
                        node: nodeToMove,
                        index: 1,
                        insertAtRoot: true,
                    };

                const parentNode = parent();
                if (parentNode)
                    newMoveOperation = {
                        parentId: parentNode.id,
                        index: indexInParent() + 1,
                        node: nodeToMove,
                    };
            }
            break;
        case DropDirection.OuterLeft:
            if (node.flexDirection === FlexDirection.Row) {
                const grandparentNode = grandparent();
                if (grandparentNode) {
                    const index = indexInGrandparent();
                    newMoveOperation = {
                        parentId: grandparentNode.id,
                        node: nodeToMove,
                        index,
                    };
                    break;
                }
            }
        // falls through
        case DropDirection.Left:
            if (node.flexDirection === FlexDirection.Row) {
                newMoveOperation = { parentId: nodeId, index: 0, node: nodeToMove };
            } else {
                const parentNode = parent();
                if (parentNode)
                    newMoveOperation = {
                        parentId: parentNode.id,
                        index: indexInParent(),
                        node: nodeToMove,
                    };
            }
            break;
        case DropDirection.OuterRight:
            if (node.flexDirection === FlexDirection.Row) {
                const grandparentNode = grandparent();
                if (grandparentNode) {
                    const index = indexInGrandparent() + 1;
                    newMoveOperation = {
                        parentId: grandparentNode.id,
                        node: nodeToMove,
                        index,
                    };
                    break;
                }
            }
        // falls through
        case DropDirection.Right:
            if (node.flexDirection === FlexDirection.Row) {
                newMoveOperation = { parentId: nodeId, index: 1, node: nodeToMove };
            } else {
                const parentNode = parent();
                if (parentNode)
                    newMoveOperation = {
                        parentId: parentNode.id,
                        index: indexInParent() + 1,
                        node: nodeToMove,
                    };
            }
            break;
        case DropDirection.Center:
            if (nodeId !== rootNode.id && nodeToMoveId !== rootNode.id) {
                const swapAction: LayoutTreeSwapNodeAction = {
                    type: LayoutTreeActionType.Swap,
                    node1Id: nodeId,
                    node2Id: nodeToMoveId,
                };
                return swapAction;
            } else {
                
            }
            break;
        default:
            
    }

    if (
        newMoveOperation?.parentId !== nodeToMoveParent()?.id ||
        (newMoveOperation.index !== nodeToMoveIndexInParent() &&
            newMoveOperation.index !== nodeToMoveIndexInParent() + 1)
    )
        return {
            type: LayoutTreeActionType.Move,
            ...newMoveOperation,
        } as LayoutTreeMoveNodeAction;
}

export function moveNode(layoutState: LayoutTreeState, action: LayoutTreeMoveNodeAction) {
    console.log("moveNode", layoutState, action);
    const rootNode = layoutState.rootNode;
    if (!action) {
        
        return;
    }
    if (action.parentId && action.insertAtRoot) {
        
        return;
    }

    const node = findNode(rootNode, action.node.id) ?? action.node;
    const parent = findNode(rootNode, action.parentId);
    const oldParent = findParent(rootNode, action.node.id);

    let startingIndex = 0;

    // If moving under the same parent, we need to make sure that we are removing the child from its old position, not its new one.
    // If the new index is before the old index, we need to start our search for the node to delete after the new index position.
    // If a node is being moved under the same parent, it can keep its size. Otherwise, it should get reset.
    if (oldParent && parent) {
        if (oldParent.id === parent.id) {
            const curIndexInParent = parent.children!.indexOf(node);
            if (curIndexInParent >= action.index) {
                startingIndex = action.index + 1;
            }
        } else {
            node.size = DefaultNodeSize;
        }
    }

    if (!parent && action.insertAtRoot) {
        if (!rootNode.children) {
            addIntermediateNode(rootNode);
        }
        addChildAt(rootNode, action.index, node);
    } else if (parent) {
        addChildAt(parent, action.index, node);
    } else {
        
    }

    // Remove nodeToInsert from its old parent
    if (oldParent) {
        removeChild(oldParent, node, startingIndex);
    }
}

export function insertNode(layoutState: LayoutTreeState, action: LayoutTreeInsertNodeAction) {
    if (!action?.node) {
        
        return;
    }
    if (!layoutState.rootNode) {
        layoutState.rootNode = action.node;
    } else {
        const insertLoc = findNextInsertLocation(layoutState.rootNode, DEFAULT_MAX_CHILDREN);
        addChildAt(insertLoc.node, insertLoc.index, action.node);
        if (action.magnified) {
            layoutState.magnifiedNodeId = action.node.id;
            layoutState.focusedNodeId = action.node.id;
        }
    }
    if (action.focused) {
        layoutState.focusedNodeId = action.node.id;
    }
}

export function insertNodeAtIndex(layoutState: LayoutTreeState, action: LayoutTreeInsertNodeAtIndexAction) {
    if (!action?.node || !action?.indexArr) {
        
        return;
    }
    if (!layoutState.rootNode) {
        layoutState.rootNode = action.node;
    } else {
        const insertLoc = findInsertLocationFromIndexArr(layoutState.rootNode, action.indexArr);
        if (!insertLoc) {
            
            return;
        }
        addChildAt(insertLoc.node, insertLoc.index + 1, action.node);
        if (action.magnified) {
            layoutState.magnifiedNodeId = action.node.id;
            layoutState.focusedNodeId = action.node.id;
        }
    }
    if (action.focused) {
        layoutState.focusedNodeId = action.node.id;
    }
}

export function swapNode(layoutState: LayoutTreeState, action: LayoutTreeSwapNodeAction) {
    if (!action.node1Id || !action.node2Id) {
        
        return;
    }

    if (action.node1Id === layoutState.rootNode.id || action.node2Id === layoutState.rootNode.id) {
        
        return;
    }
    if (action.node1Id === action.node2Id) {
        
        return;
    }

    const parentNode1 = findParent(layoutState.rootNode, action.node1Id);
    const parentNode2 = findParent(layoutState.rootNode, action.node2Id);
    const parentNode1Index = parentNode1.children!.findIndex((child) => child.id === action.node1Id);
    const parentNode2Index = parentNode2.children!.findIndex((child) => child.id === action.node2Id);

    const node1 = parentNode1.children![parentNode1Index];
    const node2 = parentNode2.children![parentNode2Index];

    const node1Size = node1.size;
    node1.size = node2.size;
    node2.size = node1Size;

    parentNode1.children[parentNode1Index] = node2;
    parentNode2.children[parentNode2Index] = node1;
}

export function deleteNode(layoutState: LayoutTreeState, action: LayoutTreeDeleteNodeAction) {
    if (!action?.nodeId) {
        
        return;
    }
    if (!layoutState.rootNode) {
        
        return;
    }
    if (layoutState.rootNode.id === action.nodeId) {
        layoutState.rootNode = undefined;
    } else {
        const parent = findParent(layoutState.rootNode, action.nodeId);
        if (parent) {
            const node = parent.children.find((child) => child.id === action.nodeId);
            removeChild(parent, node);
            if (layoutState.focusedNodeId === node.id) {
                layoutState.focusedNodeId = undefined;
            }
        } else {
            
        }
    }
}

export function resizeNode(layoutState: LayoutTreeState, action: LayoutTreeResizeNodeAction) {
    if (!action.resizeOperations) {
        
    }
    for (const resize of action.resizeOperations) {
        if (!resize.nodeId || resize.size < 0 || resize.size > 100) {
            
            return;
        }
        const node = findNode(layoutState.rootNode, resize.nodeId);
        node.size = resize.size;
    }
}

export function focusNode(layoutState: LayoutTreeState, action: LayoutTreeFocusNodeAction) {
    if (!action.nodeId) {
        
        return;
    }

    layoutState.focusedNodeId = action.nodeId;
}

export function magnifyNodeToggle(layoutState: LayoutTreeState, action: LayoutTreeMagnifyNodeToggleAction) {
    if (!action.nodeId) {
        
        return;
    }
    if (layoutState.rootNode.id === action.nodeId) {
        
        return;
    }
    if (layoutState.magnifiedNodeId === action.nodeId) {
        layoutState.magnifiedNodeId = undefined;
    } else {
        layoutState.magnifiedNodeId = action.nodeId;
        layoutState.focusedNodeId = action.nodeId;
    }
}

export function clearTree(layoutState: LayoutTreeState) {
    layoutState.rootNode = undefined;
    layoutState.leafOrder = undefined;
    layoutState.focusedNodeId = undefined;
    layoutState.magnifiedNodeId = undefined;
}

export function replaceNode(layoutState: LayoutTreeState, action: LayoutTreeReplaceNodeAction) {
    const { targetNodeId, newNode } = action;
    if (layoutState.rootNode.id === targetNodeId) {
        newNode.size = layoutState.rootNode.size; // preserve size
        layoutState.rootNode = newNode;
    } else {
        const parent = findParent(layoutState.rootNode, targetNodeId);
        if (!parent) {
            
            return;
        }
        const index = parent.children.findIndex((child) => child.id === targetNodeId);
        if (index === -1) {
            
            return;
        }
        // Preserve the old node's size.
        const targetNode = parent.children[index];
        newNode.size = targetNode.size;
        parent.children[index] = newNode;
    }
    if (action.focused) {
        layoutState.focusedNodeId = newNode.id;
    }
}

// ─── SPLIT HORIZONTAL ─────────────────────────────────────────────────────────────

export function splitHorizontal(layoutState: LayoutTreeState, action: LayoutTreeSplitHorizontalAction) {
    const { targetNodeId, newNode, position } = action;
    const targetNode = findNode(layoutState.rootNode, targetNodeId);
    if (!targetNode) {
        
        return;
    }

    const parent = findParent(layoutState.rootNode, targetNodeId);
    if (parent && parent.flexDirection === FlexDirection.Row) {
        const index = parent.children.findIndex((child) => child.id === targetNodeId);
        if (index === -1) {
            
            return;
        }
        const insertIndex = position === "before" ? index : index + 1;
        // Directly splice in the new node instead of calling addChildAt (which may flatten nodes)
        parent.children.splice(insertIndex, 0, newNode);
    } else {
        // Otherwise, if no parent or parent's flexDirection is not Row, we need to wrap
        // Create a new group node with horizontal layout.
        // IMPORTANT: pass an initial children array so the new node is valid.
        const groupNode = newLayoutNode(FlexDirection.Row, targetNode.size, [targetNode], undefined);
        // Now decide the ordering based on the "position"
        groupNode.children = position === "before" ? [newNode, targetNode] : [targetNode, newNode];
        if (parent) {
            const index = parent.children.findIndex((child) => child.id === targetNodeId);
            if (index === -1) {
                : Target node not found in parent's children", targetNodeId);
                return;
            }
            parent.children[index] = groupNode;
        } else {
            layoutState.rootNode = groupNode;
        }
    }
    if (action.focused) {
        layoutState.focusedNodeId = newNode.id;
    }
}

// ─── SPLIT VERTICAL ─────────────────────────────────────────────────────────────

export function splitVertical(layoutState: LayoutTreeState, action: LayoutTreeSplitVerticalAction) {
    const { targetNodeId, newNode, position } = action;
    const targetNode = findNode(layoutState.rootNode, targetNodeId);
    if (!targetNode) {
        
        return;
    }

    const parent = findParent(layoutState.rootNode, targetNodeId);
    if (parent && parent.flexDirection === FlexDirection.Column) {
        const index = parent.children.findIndex((child) => child.id === targetNodeId);
        if (index === -1) {
            
            return;
        }
        const insertIndex = position === "before" ? index : index + 1;
        // For vertical splits in an already vertical parent, splice directly.
        parent.children.splice(insertIndex, 0, newNode);
    } else {
        // Wrap target node in a new vertical group.
        // Create group node with an initial children array so that validation passes.
        const groupNode = newLayoutNode(FlexDirection.Column, targetNode.size, [targetNode], undefined);
        groupNode.children = position === "before" ? [newNode, targetNode] : [targetNode, newNode];
        if (parent) {
            const index = parent.children.findIndex((child) => child.id === targetNodeId);
            if (index === -1) {
                : Target node not found in parent's children", targetNodeId);
                return;
            }
            parent.children[index] = groupNode;
        } else {
            layoutState.rootNode = groupNode;
        }
    }
    if (action.focused) {
        layoutState.focusedNodeId = newNode.id;
    }
}
