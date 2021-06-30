import ReactDOM from './Dreact/react-dom';
import './index.css';

function FunctionComponent(props) {
  return (
    <div className="functionBorder">
      <p>函数组件-{props.name}</p>
    </div>
  )
}

const jsx = (
  <div className="border">
    <h1>react17</h1>
    <a href="www.baidu.com">didi</a>
    <FunctionComponent name="function"/>
  </div>
)

ReactDOM.render(jsx, document.getElementById('root'));

