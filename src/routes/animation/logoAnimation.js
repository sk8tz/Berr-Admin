import React,  {PropTypes}  from 'react'
import TweenOne, { TweenOneGroup } from 'rc-tween-one';
import ticker from 'rc-tween-one/lib/ticker';
import { Input, Button, InputNumber, Radio, Icon } from 'antd';
import enquire from 'enquire.js';
import ReactDOM from 'react-dom'
import styles from './logoAnimation.less'

const RadioGroup = Radio.Group;

class LogoGather extends React.Component {
  static propTypes = {
    image: React.PropTypes.string,
    w: React.PropTypes.number,
    h: React.PropTypes.number,
    pixSize: React.PropTypes.number,
    pointSizeMin: React.PropTypes.number,
  };

  static defaultProps = {
    image: './assets/404.png',
    className: 'logo-gather-demo',
    w: 250,
    h: 250,
    pixSize: 20,
    pointSizeMin: 10,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.interval = null;
    this.gather = true;
    this.intervalTime = 5000;
  }

  componentDidMount() {
    this.dom = ReactDOM.findDOMNode(this);
    this.createPointData();
  }

  componentWillUnmount() {
    ticker.clear(this.interval);
    this.interval = null;
  }

  onMouseEnter = () => {
    // !this.gather && this.updateTweenData();
    if (!this.gather) {
      this.updateTweenData();
    }
    this.componentWillUnmount();
  };

  onMouseLeave = () => {
    // this.gather && this.updateTweenData();
    if (this.gather) {
      this.updateTweenData();
    }
    this.interval = ticker.interval(this.updateTweenData, this.intervalTime);
  };

  setDataToDom(data, w, h) {
    this.pointArray = [];
    const number = this.props.pixSize;
    for (let i = 0; i < w; i += number) {
      for (let j = 0; j < h; j += number) {
        if (data[((i + j * w) * 4) + 3] > 150) {
          this.pointArray.push({ x: i, y: j });
        }
      }
    }
    const children = [];
    this.pointArray.forEach((item, i) => {
      const r = Math.random() * this.props.pointSizeMin + this.props.pointSizeMin;
      const b = Math.random() * 0.4 + 0.1;
      children.push(
        <TweenOne className="point-wrapper" key={i} style={{ left: item.x, top: item.y }}>
          <TweenOne
            className="point"
            style={{
              width: r,
              height: r,
              opacity: b,
              backgroundColor: `rgb(${Math.round(Math.random() * 95 + 160)},255,255)`,
            }}
            animation={{
              y: (Math.random() * 2 - 1) * 10 || 5,
              x: (Math.random() * 2 - 1) * 5 || 2.5,
              delay: Math.random() * 1000,
              repeat: -1,
              duration: 3000,
              yoyo: true,
              ease: 'easeInOutQuad',
            }}
          />
        </TweenOne>
      );
    });
    this.setState({
      children,
      boxAnim: { opacity: 0, type: 'from', duration: 800 },
    }, () => {
      this.interval = ticker.interval(this.updateTweenData, this.intervalTime);
    });
  }

  createPointData = () => {
    const { w, h } = this.props;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    canvas.width = this.props.w;
    canvas.height = h;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      this.setDataToDom(data, w, h);
      this.dom.removeChild(canvas);
    };
    img.crossOrigin = 'anonymous';
    img.src = this.props.image;
  };

  gatherData = () => {
    const children = this.state.children.map(item =>
      React.cloneElement(item, {
        animation: {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          delay: Math.random() * 500,
          duration: 800,
          ease: 'easeInOutQuint',
        },
      })
    );
    this.setState({ children });
  };

  disperseData = () => {
    const rect = this.dom.getBoundingClientRect();
    const sideRect = this.sideBox.getBoundingClientRect();
    const sideTop = sideRect.top - rect.top;
    const sideLeft = sideRect.left - rect.left;
    const children = this.state.children.map(item =>
      React.cloneElement(item, {
        animation: {
          x: Math.random() * rect.width - sideLeft - item.props.style.left,
          y: Math.random() * rect.height - sideTop - item.props.style.top,
          opacity: Math.random() * 0.4 + 0.1,
          scale: Math.random() * 2.4 + 0.1,
          duration: Math.random() * 500 + 500,
          ease: 'easeInOutQuint',
        },
      })
    );

    this.setState({
      children,
    });
  };

  updateTweenData = () => {
    this.dom = ReactDOM.findDOMNode(this);
    this.sideBox = ReactDOM.findDOMNode(this.sideBoxComp);
    ((this.gather && this.disperseData) || this.gatherData)();
    this.gather = !this.gather;
  };

  render() {
    return (<div className="logo-gather-demo-wrapper">
      <canvas id="canvas" />
      <TweenOne
        animation={this.state.boxAnim}
        className="right-side blur"
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        ref={(c) => {
          this.sideBoxComp = c;
        }}
      >
        {this.state.children}
      </TweenOne>
    </div>);
  }
}
class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.defaultImage = {
      a: './assets/js.png',
      b: './assets/404.png',
      c: './assets/react.svg',
    };
    this.state = {
      image: this.defaultImage.a,
      pixSize: 20,
      pointSize: 10,
      isMode: false,
      show: true,
    };
  }

  componentDidMount() {
    this.enquireScreen((isMode) => {
      this.setState({ isMode });
    });
  }

  enquireScreen = (cb) => {
    /* eslint-disable no-unused-expressions */
    enquire.register('only screen and (min-width: 320px) and (max-width: 767px)', {
      match: () => {
        cb && cb(true);
      },
      unmatch: () => {
        cb && cb();
      },
    });
    /* eslint-enable no-unused-expressions */
  }

  onChangeImage = (e) => {
    const dom = e.target;
    this.image = dom.value;
  }

  onChangePix = (num) => {
    this.pixSize = num;
  }

  onClick = () => {
    if (this.image || this.pixSize || this.pointSize) {
      this.setState({
        image: this.image || this.state.image,
        pixSize: typeof this.pixSize === 'number' ? this.pixSize : this.state.pixSize,
        pointSize: typeof this.pointSize === 'number' ? this.pointSize : this.state.pointSize,
        update: true,
      }, () => {
        this.setState({
          update: false,
        });
      });
    }
  }

  onChangeRadio = (e) => {
    const target = e.target;
    const value = target.value;
    this.image = this.defaultImage[value];
    this.setState({
      value,
    });
  }

  onChangePoint = (num) => {
    this.pointSize = num;
  }

  phoneClick = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  render() {
    return (<div style={{ position: 'relative' }}>
      {!this.state.update && <LogoGather
        image={this.state.image}
        pixSize={this.state.pixSize}
        pointSizeMin={this.state.pointSize}
      />}
      <div className={`logo-gather-demo-edit-wrapper ${this.state.show ? 'open' : ''}`}>
        {this.state.isMode && (<div className="edit-button" onClick={this.phoneClick}>
          <Icon type="down"/>
        </div>)}
        <ul>
          <li>Image:</li>
          <li >
            <RadioGroup onChange={this.onChangeRadio} defaultValue="a">
              <Radio value="a">
                <img
                  src={this.defaultImage.a}
                  height="30"
                />
              </Radio>
              <Radio value="b">
                <img
                  src={this.defaultImage.b}
                  height="30"
                />
              </Radio>
              <Radio value="c">
                <img
                  src={this.defaultImage.c}
                  height="30"
                />
              </Radio>
              <Radio key="d" value="d" className={`${this.state.isMode ? 'none' : ''}`}>
                Url
                <TweenOneGroup
                  style={{ display: 'inline-block', height: 0 }}
                  enter={{ width: 0, opacity: 0, type: 'from' }}
                  leave={{ width: 0, opacity: 0 }}
                >
                  {this.state.value === 'd' ?
                    (<div key="d">
                      <Input
                        placeholder=" png, svg url "
                        style={{ width: 120, marginLeft: 5 }}
                        onChange={this.onChangeImage}
                      />
                    </div>) : null}
                </TweenOneGroup>
              </Radio>
            </RadioGroup>
          </li>
          <li className={`${this.state.isMode ? 'phone-float-none' : ''}`}>Image takes the pixel :</li>
          <li>
            <InputNumber
              defaultValue={this.state.pixSize}
              min={15}
              style={{ width: 60 }}
              onChange={this.onChangePix}
            />
          </li>
          <li className={`${this.state.isMode ? 'phone-float-none' : ''}`}> Random Point wide:</li>
          <li>
            <InputNumber
              defaultValue={this.state.pointSize}
              style={{ width: 60 }}
              onChange={this.onChangePoint}
            />
          </li>
          <li className={`${this.state.isMode ? 'phone-float-none' : ''}`}>
            <Button type="primary" onClick={this.onClick}>Apply</Button>
          </li>
        </ul>
      
      </div>
      <div className="clearfix"></div>
    </div>);
  }
}
export default Edit