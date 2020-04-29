# vue-cli3 jsx底层依赖解析

## 1. 环境基础babel

vue-cli3自动生成的app项目中，babel.config.js预设了
presets: ["@vue/app"]，该插件为[babel-preset-app](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/babel-preset-app/package.json
)

里面包含插件，主要是babel解析，以支持许多扩展语法。比如`jsx、es6语法`等：

``` json
"@babel/core": "^7.9.0",
"@babel/helper-compilation-targets": "^7.8.7",
"@babel/helper-module-imports": "^7.8.3",
"@babel/plugin-proposal-class-properties": "^7.8.3",
"@babel/plugin-proposal-decorators": "^7.8.3",
"@babel/plugin-syntax-dynamic-import": "^7.8.3",
"@babel/plugin-syntax-jsx": "^7.8.3",
"@babel/plugin-transform-runtime": "^7.9.0",
"@babel/preset-env": "^7.9.0",
"@babel/runtime": "^7.9.2",
"@vue/babel-preset-jsx": "^1.1.2",
"babel-plugin-dynamic-import-node": "^2.3.0",
```

里面重点插件有:

### Babel JSX插件集合

* [@vue/babel-preset-jsx](https://github.com/vuejs/jsx/tree/master/packages/babel-preset-jsx)：vue jsx插件集合，vue官方出品
    * [解析jsx为vnode函数（核心）@vue/babel-plugin-transform-vue-jsx](https://github.com/vuejs/jsx/blob/master/packages/babel-plugin-transform-vue-jsx/README.md)
        * 支持解析jsx
        * 支持jsx props扩展
        * 支持vue directives
        * 支持直接导入component
    * [v-model语法糖 @vue/babel-sugar-v-model](https://github.com/vuejs/jsx/blob/master/packages/babel-sugar-v-model/README.md)
    * [自动在render函数注入h方法 @vue/babel-sugar-inject-h](https://github.com/vuejs/jsx/blob/master/packages/babel-sugar-inject-h/src/index.js)
    * [支持在jsx中 functional @vue/babel-sugar-functional-vue](https://github.com/vuejs/jsx/blob/master/packages/babel-sugar-functional-vue/README.md)
    * [支持v-on事件 @vue/babel-sugar-v-on](https://github.com/vuejs/jsx/blob/master/packages/babel-sugar-v-on/README.md)
    * [自动合并jsx props @vue/babel-helper-vue-jsx-merge-props](https://github.com/vuejs/jsx/blob/master/packages/babel-helper-vue-jsx-merge-props/README.md)

### Babel预设插件集合

* [@babel/preset-env](https://github.com/babel/babel/blob/master/packages/babel-preset-env/package.json) babel智能预设
    * 集成了[browserslist](https://github.com/browserslist/browserslist)，该插件包含其他核心插件：
        * [postcss-preset-env](https://github.com/csstools/postcss-preset-env)，将现代css转换成浏览器理解的
        * [autoprefixer](https://github.com/postcss/autoprefixer),解析css成兼容多个浏览器
    * 众多ES6 Stage语法支持，比如：
        * 支持[class语法](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-classes)
        * 支持[对象rest spread](https://github.com/babel/babel/tree/master/packages/babel-plugin-proposal-object-rest-spread)
        * 支持[for of](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-for-of)
        * 支持[箭头函数](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-arrow-functions)
    * 参数targets：为项目支持/目标的环境
        * 默认转换所有ECMAScript 2015+代码
        * chrome，opera，edge，firefox，safari，ie，ios，android 确定最低版本要求
        * node
        * electron
    * 参数targets.esmodules： 定位为支持ES模块的浏览器（`直接支持ES6模块语法，浏览器能自己解析import语法`，可显著减少包体积）。注意：指定esmodules目标时，浏览器目标将被忽略
    * 参数modules：`启用将ES6模块语法转换为其他模块类型的功能`。"amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false，默认为"auto"。`设置为false不会转换模块`
    * 参数targets.browsers: 同上targets作用
    * 参数target.node: 同上targets作用

#### 其他

* [@babel/core](https://babeljs.io/docs/en/next/babel-core.html): 根据本地配置的[config文件](https://babeljs.io/docs/en/next/config-files)（babel7考虑到monorepos项目存在，所以采用了babel.config.json配置文件，以作用全局），把代码转换。（所有babel插件必备前置包）
* [@babel/cli](https://babeljs.io/docs/en/next/babel-cli.html): 客户端执行，依赖上面@babel/core。

## JSX在Vue中语法

react和vue底层vnode diff对比不是使用相同的数据结构，所以导致两者jsx书写方式有些许不同。目前两者大部分jsx语法一致，是因为有各种babel插件辅助做了这部分事。但对于动态属性这样自由化较高的地方，需要我们知道两者本质区别。

``` js
render (h) {
  return h('div', {
    // Component props
    props: {
      msg: 'hi'
    },
    // Normal HTML attributes
    attrs: {
      id: 'foo'
    },
    // DOM props
    domProps: {
      innerHTML: 'bar'
    },
    // Event handlers are nested under "on", though
    // modifiers such as in v-on:keyup.enter are not
    // supported. You'll have to manually check the
    // keyCode in the handler instead.
    on: {
      click: this.clickHandler
    },
    // For components only. Allows you to listen to
    // native events, rather than events emitted from
    // the component using vm.$emit.
    nativeOn: {
      click: this.nativeClickHandler
    },
    // Class is a special module, same API as `v-bind:class`
    class: {
      foo: true,
      bar: false
    },
    // Style is also same as `v-bind:style`
    style: {
      color: 'red',
      fontSize: '14px'
    },
    // Other special top-level properties
    key: 'key',
    ref: 'ref',
    // Assign the `ref` is used on elements/components with v-for
    refInFor: true,
    slot: 'slot'
  })
}
```

以上等同于：

``` js
render (h) {
  return (
    <div
      // Component props
      propsMsg="hi"
      // Normal attributes or component props.
      id="foo"
      // DOM properties are prefixed with `domProps`
      domPropsInnerHTML="bar"
      // event listeners are prefixed with `on` or `nativeOn`
      onClick={this.clickHandler}
      nativeOnClick={this.nativeClickHandler}
      // other special top-level properties
      class={{ foo: true, bar: false }}
      style={{ color: 'red', fontSize: '14px' }}
      key="key"
      ref="ref"
      // assign the `ref` is used on elements/components with v-for
      refInFor
      slot="slot">
    </div>
  )
}
```

![](https://upload-images.jianshu.io/upload_images/16771310-003dfb5b21204874.png?imageMogr2/auto-orient/strip|imageView2/2/w/446/format/webp)

### 基础

bable jsx插件会通过正则匹配的方式在编译阶段将书写在组件上属性进行“分类”。 onXXX的均被认为是事件，nativeOnXXX是原生事件，domPropsXXX是Dom属性。

class,staticClass,style,key,ref,refInFor,slot,scopedSlots这些被认为是顶级属性，至于我们属性声明的props，以及html属性attrs，不需要加前缀，**插件会将其统一分类到attrs属性下，然后在运行阶段根据是否在props声明来决定属性归属(即属于props还是attrs)**。

``` js
const ButtonCounter = {
  name: "button-counter",
  props: ["count"],
  methods: {
    onClick() {
      this.$emit("change", this.count + 1);
    }
  },
  render() {
    return (
      <button onClick={this.onClick}>You clicked me {this.count} times.</button>
    );
  }
};

export default {
  name: "button-counter-container",
  data() {
    return {
      count: 0
    };
  },
  methods: {
    onChange(val) {
      this.count = val;
    }
  },
  render() {
    const { count, onChange } = this;
    return (
      <div>
        <ButtonCounter
          style={{ marginTop: "10px" }}
          count={count}
          type="button"
          onChange={onChange}
        />
        <ButtonCounter
          style={{ marginTop: "10px" }}
          count={count}
          type="button"
          domPropsInnerHTML={`hello ${this.count}.`}
          onChange={onChange}
        />
      </div>
    );
  }
};
```

### 动态属性

在React中所有属性都是顶级属性，直接使用{...props}就可以了，但是在Vue中，你需要明确该属性所属的分类，如一个动态属性value和事件change，你可以使用如下方式(延展属性)传递：

``` js
const dynamicProps = {
  props: {},
  on: {},
}
if(haValue) dynamicProps.props.value = value
if(hasChange) dynamicProps.on.change = onChange
<Dynamic {...dynamicProps} />
```

尽量使用明确分类的方式传递属性，而不是要babel插件帮你分类及合并属性。

### 指令

``` js
// v-show,同理v-if
render(){
       return (
         <div>
           {this.show?'你帅':'你丑'}
         </div>
       )
     }

// v-for
render(){
        return (
          <div>
            {this.list.map((v)=>{
              return <p>{v}</p>
            })}
          </div>
        )
      }

// v-model： 传值和监听事件改变值(babel插件已支持)
data(){
        return{
          text:'',
        }
      },
      methods:{
        input(e){
          this.text=e.target.value
        }
      },
      render(){
        return (
          <div>
            <input type="text" value={this.text} onInput={this.input}/>
            <p>{this.text}</p>
          </div>
        )
      }
```

### functional函数

``` js
export default {
    functional:true,
    render(h,context){
        return (
          <div class="red" {...context.data}>
            {context.props.data}
          </div>
        )
      }
    }

```

### 组件

``` js
import Todo from './Todo.js'

export default {
  render(h) {
    return <Todo /> // no need to register Todo via components option
  },
}
```

### slot



## 参考文章

* [JavaScript modules 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
* [babel-preset-env](https://babeljs.io/docs/en/babel-preset-env)
* [babel jsx语法扩展说明](https://github.com/vuejs/babel-plugin-transform-vue-jsx)
* https://cn.vuejs.org/v2/guide/render-function.html#v-model
* https://juejin.im/post/5b221e2951882574aa5f4c5a
* https://juejin.im/post/5affa64df265da0b93488fdd