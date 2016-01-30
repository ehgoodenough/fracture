var React = require("react")
var ReactDOM = require("react-dom")
var Loop = require("./scripts/Loop")

class Robot {
    constructor() {
        this.position = {x: 1, y: 1}
        this.color = "#DEB74A"
    }
    render() {
        return React.createElement("div", {
            style: this.style()
        })
    }
    style() {
        return {
            "width": 1 + "em",
            "height": 1 + "em",
            "position": "absolute",
            "top": this.position.y + "em",
            "left": this.position.x + "em",
            "backgroundColor": this.color,
        }
    }
}

window.robot = new Robot({
    x: 0, y:1
})

class Component extends React.Component {
    render() {
        return (
            <div id="frame">
                {robot.render()}
            </div>
        )
    }
    componentDidMount() {
        var loop = new Loop((tick) => {
            this.forceUpdate()
        })
    }
}

ReactDOM.render(<Component/>, document.getElementById("mount"))