
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component
export default class App extends Vue {

  public value = ''; // 支持v-model
  public msg = '';
  private isShow = true

  @Watch('value') // 支持watch
  protected valueWatch(newV: any, oldV: any) {
    this.msg = `监听到属性value发生变化，新的值为：${newV}`;
  }

  public get valueLength() {
    return this.value.length;
  }

  public mounted() {
    console.log(this.$refs.aBtn, '支持ref')
  }

  protected clickHandle = () => { // 支持绑定事件
    console.log(this instanceof Vue, 111)
  }

  protected render() {
    let btnDynamicProps = {
        props: { type: 'dashed', icon: "search" },
        on: { click: () => console.log(123) } // 支持动态属性，并且自动合并事件
    }
    return (
      <div>
        <a-button type="primary" onClick={this.clickHandle} {...btnDynamicProps} ref="aBtn">Test</a-button>
        <a-input type='text' v-model={this.value} />
        {this.isShow ? this.value : null}
        <ul>
            支持js for循环:
            {Array(3).fill('').map((s, i) => <li>循环次数{i}</li>)}
        </ul>
        
        <p>支持watch：{this.msg}</p>
        <p>支持computed：{this.valueLength}</p>
      </div>

    );

  }

}
