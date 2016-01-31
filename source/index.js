//http://www.colourpod.com/post/138222494225/where-are-all-the-scientists-now-submitted-by
//http://www.roguebasin.com/index.php?title=7DRL_Challenge_2016

var React = require("react")
var ReactDOM = require("react-dom")
var Shortid = require("shortid")
var Loop = require("./scripts/Loop")
var Input = require("./scripts/Input")

var WIDTH = 9, HEIGHT = 9

class Position {
    constructor(protoposition = {}) {
        this.x = protoposition.x || 0
        this.y = protoposition.y || 0
    }
}

class Entity {
    constructor(protoentity = new Object()) {
        this.position = new Position(protoentity.position)
        this.color = protoentity.color || "#CC0000"
        this.symbol = protoentity.symbol || "~"
        this.id = Shortid.generate()
    }
    examine() {
        return "Nothing of interest."
    }
}

class Hero extends Entity {
    constructor(protohero) {
        super(protohero)
        this.symbol = "@"
        this.color = "#DEB74A"
        this.name = protohero.name || "Bob"
        window.hero = this
        
        this.health = 3
        
        this.direction = -1
        this.prevposition = new Position(this.position)
    }
    update(tick) {
        if(Input.isJustDown("W")
        || Input.isJustDown("<up>")) {
            this.move({y: -1})
        } else if(Input.isJustDown("S")
        || Input.isJustDown("<down>")) {
            this.move({y: +1})
        } else if(Input.isJustDown("A")
        || Input.isJustDown("<left>")) {
            this.move({x: -1})
        } else if(Input.isJustDown("D")
        || Input.isJustDown("<right>")) {
            this.move({x: +1})
        } else if(Input.isJustDown("<space>")) {
            this.move({})
        }
    }
    move(movement = {}) {
        movement.x = movement.x || 0
        movement.y = movement.y || 0
        
        this.direction = movement.x < 0 ? -1 : this.direction
        this.direction = movement.x > 0 ? +1 : this.direction

        if(this.position.x + movement.x < 0
        || this.position.x + movement.x >= WIDTH
        || this.position.y + movement.y < 0
        || this.position.y + movement.y >= HEIGHT) {
            movement.x = 0
            movement.y = 0
        }

        game.forEach((entity) => {
            if(entity != this) {
                if(this.position.x + movement.x == entity.position.x
                && this.position.y + movement.y == entity.position.y) {
                    if(!!entity.isAttacked) {
                        entity.isAttacked()
                    }
                    movement.x = 0
                    movement.y = 0
                }
            }
        })

        this.prevposition.x = this.position.x
        this.prevposition.y = this.position.y
        this.position.x += movement.x
        this.position.y += movement.y

        game.forEach((entity) => {
            if(entity != this) {
                if(!!entity.op) {
                    entity.op()
                }
            }
        })
    }
    isAttacked() {
        this.health -= 1
        if(this.health <= 0) {
            console.log("You died!")
            window.location = window.location
        }
    }
}

class Monster extends Entity {
    isAttacked() {
        this.health -= 1
        if(this.health <= 0) {
            game.splice(game.indexOf(this), 1)
        }
    }
}

class Goo extends Monster {
    constructor(protogoo) {
        super(protogoo)
        this.color = "#A52F22"
        this.isPrepared = Math.random() < 0.5
        this.symbol = this.isPrepared ? "G" : "g"
        this.health = 1
    }
    op() {
        if(this.isPrepared == false) {
            this.isPrepared = true
            this.symbol = "G"
        } else if(this.isPrepared = true) {
            this.isPrepared = false
            this.symbol = "g"
    
            // move towards the hero, prioritzing
            // whichever vector has a longer magnitude.
            if(Math.abs(this.position.y - ((hero.position.y + hero.prevposition.y) / 2))
            >= Math.abs(this.position.x - ((hero.position.x + hero.prevposition.x) / 2))) {
                if(this.position.y > hero.position.y) {
                    this.move({y: -1})
                } else if(this.position.y < hero.position.y) {
                    this.move({y: +1})
                }
            } else {
                if(this.position.x > hero.position.x) {
                    this.move({x: -1})
                } else if(this.position.x < hero.position.x) {
                    this.move({x: +1})
                }
            }
        }
    }
    move(movement) {
        movement.x = movement.x || 0
        movement.y = movement.y || 0
        
        game.forEach((entity) => {
            if(entity != this) {
                if(this.position.x + movement.x == entity.position.x
                && this.position.y + movement.y == entity.position.y) {
                    if(entity instanceof Hero) {
                        if(!!entity.isAttacked) {
                            entity.isAttacked()
                        }
                    }
                    movement.x = 0
                    movement.y = 0
                }
            }
        })
        
        this.position.x += movement.x
        this.position.y += movement.y
    }
}

class StrongGoo extends Goo {
    constructor(protogoo) {
        super(protogoo)
        this.color = "#75000C"
        this.health *= 2
    }
}

window.game = [
    new Hero({
        position: new Position({x: 2, y: 2})
    }),
    new Goo({
        position: new Position({x: 4, y: 4})
    }),
    new StrongGoo({
        position: new Position({x: 5, y: 4})
    })
]

class GameComponent extends React.Component {
    render() {
        return (
            <div id="frame">
                {game.map((entity) => {
                    if(entity instanceof Entity) {
                        return (
                            <EntityComponent
                                key={entity.id}
                                entity={entity}/>
                        )
                    }
                })}
                <MenuComponent hero={hero}/>
            </div>
        )
    }
    componentDidMount() {
        var loop = new Loop((tick) => {
            hero.update(tick)
            this.forceUpdate()
        })
    }
}


class EntityComponent extends React.Component {
    render() {
        return (
            <div className="entity" style={this.style()}>
                {this.props.entity.symbol || "~"}
            </div>
        )
    }
    style() {
        return {
            "color": this.props.entity.color || "#C00",
            "top": Math.floor(this.props.entity.position.y) + "em",
            "left": Math.floor(this.props.entity.position.x) + "em",
            "transform": [
                //`scaleX(${this.props.entity.direction * -1 || 1})`
            ].join(",")
        }
    }
}

class MenuComponent extends React.Component {
    render() {
        return (
            <div id="menu">
                {this.renderHearts()}
            </div>
        )
    }
    renderHearts() {
        var hearts = new Array()
        for(var i = 0; i < this.props.hero.health; i++) {
            hearts.push(<span key={i}>#</span>)
        }
        return hearts
    }
}

ReactDOM.render(<GameComponent/>, document.getElementById("mount"))

////////////////////////////////
//////////// TO DO ////////////
//////////////////////////////
// Listen for Input.isStillDown()