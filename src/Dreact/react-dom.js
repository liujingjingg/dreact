// vnode 虚拟dom对象
// node 真实dom节点

// 初次渲染
let wipRoot = null;
function render(vnode, container) {
    wipRoot = {
        type: 'div',
        props: {
            children: { ...vnode },
        },
        stateNode: container,
    };
    nextUnitOfWork = wipRoot;
}

function createNode(workInProgress) {
    const { type } = workInProgress;
    const node = document.createElement(type);
    updateNode(node, workInProgress.props);
    return node;
}

function updateFuntionComponent(workInProgress) {
    const { type, props } = workInProgress;
    const children = type(props);
    reconcileChildren(workInProgress, children);
}

function updateHostComponent(workInProgress) {
    // const { type, props } = workInProgress;
    if (!workInProgress.stateNode) {
        workInProgress.stateNode = createNode(workInProgress);
    }
    reconcileChildren(workInProgress, workInProgress.props.children)
}
// 更新属性
function updateNode(node, nextVal) {
    Object.keys(nextVal).forEach((k) => {
        if (k === "children") {
            if (typeof nextVal[k] === "string") {
                node.textContent = nextVal[k];
            }
        } else {
            node[k] = nextVal[k]
        }
    })
}

function updateTextComponent(workInProgress) {
    if(!workInProgress.stateNode){
        // 真实dom节点
        workInProgress.stateNode = document.createTextNode(workInProgress.props);
    }
}

function reconcileChildren(workInProgress, children) {
    if (typeof children === 'string' || typeof children === 'number') {
        return;
    }
    const newChildren = Array.isArray(children) ? children : [children];
    let previousNewFiber = null;
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        let newFiber = {
            type: child.type,
            props: { ...child.props },
            stateNode: null,
            child: null,
            sibling: null,
            return: workInProgress,
        };
        if (typeof child === "string") {
            newFiber.props = child;
        }
        if (i === 0) {
            // 第一个子fiber
            workInProgress.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }
        // 记录上一个fiber
        previousNewFiber = newFiber;
    }
}

// 下一个单元任务 fiber
let nextUnitOfWork = null;

function performUnitOfWork(workInProgress) {
    // 执行任务
    const { type } = workInProgress;
    if (typeof type === "string") {
        // 原生标签节点
        updateHostComponent(workInProgress);
    } else if (typeof type === "function") {
        updateFuntionComponent(workInProgress);
    } else if (typeof type === "undefined") {
        updateTextComponent(workInProgress);
    }
    // 返回下一个执行任务
    if (workInProgress.child) {
        return workInProgress.child;
    }

    let nextFiber = workInProgress;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.return;
    }
}

function workLoop(IdleDeadline) {
    while (nextUnitOfWork && IdleDeadline.timeRemaining() > 1) {
        // 执行任务，并且返回下一个执行任务
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }

    // 遍历完以后 提交
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

}

requestIdleCallback(workLoop)

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(workInProgress) {
    // 提交自己
    if (!workInProgress) {
        return;
    }
    let parentNodeFiber = workInProgress.return;
    // 父fiber不一定有dom节点
    while (!parentNodeFiber.stateNode) {
        parentNodeFiber = parentNodeFiber.return;
    }
    let parentNode = parentNodeFiber.stateNode;
    if (workInProgress.stateNode) {
        parentNode.appendChild(workInProgress.stateNode);
    }
    // 提交子节点
    commitWork(workInProgress.child);
    // 提交兄弟节点
    commitWork(workInProgress.sibling)
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { render };