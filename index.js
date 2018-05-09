const CREATE = 'CREATE'   //新增一个节点
const REMOVE = 'REMOVE'   //删除原节点
const REPLACE = 'REPLACE'  //替换原节点
const UPDATE = 'UPDATE'    //检查属性或子节点是否有变化
const SET_PROP = 'SET_PROP'  //新增或替换属性
const REMOVE_PROP = 'REMOVE PROP'  //删除属性

function view(count) {
    const r = [...Array(count).keys()]
    return <ul id="filmList" className={ `list-${count % 3}` }>
        {
            r.map(n => <li>item { (count * n).toString() }</li>)
        }
    </ul>
}

function flatten(arr) {
    return [].concat(...arr)
}
  
function h(type, props, ...children) {
    return {
        type,
        props: props || {},
        children: flatten(children)
    }
}

function render(el) {
    const initialCount = 0;

    el.appendChild(createElement(view(initialCount)));

    setTimeout(() => tick(el, initialCount), 1000);
}

function tick(el, count) {
    const patches = diff(view(count + 1), view(count));
    patch(el, patches);

    if (count > 5) {
        return;
    }

    setTimeout(() => tick(el, count + 1), 1000)
}

function diff(newNode, oldNode) {
    // 假如旧节点不存在，我们返回的patches对象, 类型为新增节点；
    if (!oldNode) {
        return { type: CREATE, newNode }
    }
 
    // 假如新节点不存在，表示是删除节点；
    if (!newNode) {
        return { type: REMOVE }
    }
 
    // 假如两者都存在的话，调用changed函数判断他们是不是有变动；
    if (changed(newNode, oldNode)) {
        return { type: REPLACE, newNode }
    }
 
    // 假如两者都存在，且changed()返回false的话，判断新节点是否是VDOM（根据type是否存在来判断的，因为type不存在的话，newNode要么是空节点，要么是字符串）。假如新节点是VDOM，则返回一个patches对象，类型是UPDATE，同时对props和children分别进行diffProps和diffChildren操作。
    if (newNode.type) {
        return {
            type: UPDATE,
            props: diffProps(newNode, oldNode),
            children: diffChildren(newNode, oldNode)
        }
    }
}

// 判断节点是否变更
function changed(node1, node2) {
    return typeof(node1) !== typeof(node2) ||
           typeof(node1) === 'string' && node1 !== node2 ||
           node1.type !== node2.type
}

// 对比属性
function diffProps(newNode, oldNode) {
    let patches = []
  
    // 首先我们采用最大可能性原则，将新旧VDOM的所有属性都合并赋值给一个新的变量props
    let props = Object.assign({}, newNode.props, oldNode.props)

    // 遍历props变量的所有Keys，依次比较新旧VDOM对于这个KEY的值
    Object.keys(props).forEach(key => {
        const newVal = newNode.props[key];
        const oldVal = oldNode.props[key];
        // 假如新值不存在，表示这个属性被删除了
        if (!newVal) {
            patches.push({type: REMOVE_PROP, key, value: oldVal})
        }
  
        // 假如旧值不存在，或者新旧值不同，则表示我们需要重新设置这个属性
        if (!oldVal || newVal !== oldVal) {
            patches.push({ type: SET_PROP, key, value: newVal})
        }
    })
  
    return patches
}

// 对比子节点
function diffChildren(newNode, oldNode) {
    let patches = []
  
    const maximumLength = Math.max(
        newNode.children.length,
        oldNode.children.length
    )
    for(let i = 0; i < maximumLength; i++) {
        patches[i] = diff(
            newNode.children[i],
            oldNode.children[i]
        )
    }
  
    return patches
}

function patch(parent, patches, index = 0) {
    // 首先当patches不存在时，直接return，不进行任何操作
    if (!patches) {
        return;
    }
  
    // 利用childNodes和Index取出当前正在处理的这个节点，赋值为el
    const el = parent.childNodes[index];
    // 开始判断补丁的类型
    switch (patches.type) {
        case CREATE: {                                              // 当类型是CREATE时，生成一个新节点，并append到根节点
            const { newNode } = patches;
            const newEl = createElement(newNode);
            parent.appendChild(newEl);
            break;
        }
        case REMOVE: {                                              // 当类型是REMOVE时，直接删除当前节点el
            parent.removeChild(el);
            break;
        }
        case REPLACE: {                                             // 当类型是REPLACE时，生成新节点，同时替换掉原节点
            const {newNode} = patches;
            const newEl = createElement(newNode);
            return parent.replaceChild(newEl, el);
            break;
        }
        case UPDATE: {                                              // 当类型是UPDATE时，需要我们特殊处理
            const {props, children} = patches;
            patchProps(el, props);
            for(let i = 0; i < children.length; i++) {
                patch(el, children[i], i);
            }
        }
    }
}

function patchProps(parent, patches) {
    patches.forEach(patch => {
        const { type, key, value } = patch
        if (type === 'SET_PROP') {
            setProp(parent, key, value)
        }
        if (type === 'REMOVE_PROP') {
            removeProp(parent, key, value)
        }
    })
}
  
function removeProp(target, name, value) { //@
    if (name === 'className') {
        return target.removeAttribute('class')
    }
  
    target.removeAttribute(name)
}

function createElement(node) {
    if (typeof(node) === 'string') {
        return document.createTextNode(node)
    }
  
    let { type, props, children } = node
    
    // 创建当前元素
    const el = document.createElement(type)
    // 为当前元素设置属性
    setProps(el, props)

    // 创建子元素 并添加到父元素中
    children.map(createElement)
      .forEach(el.appendChild.bind(el))
  
    return el
}
  
function setProp(target, name, value) {
    if (name === 'className') {
        return target.setAttribute('class', value)
    }
  
    target.setAttribute(name, value)
}
  
function setProps(target, props) {
    Object.keys(props).forEach(key => {
        setProp(target, key, props[key])
    })
}