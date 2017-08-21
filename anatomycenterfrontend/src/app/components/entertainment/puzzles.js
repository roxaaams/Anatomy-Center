import React, { Component, PropTypes } from "react";

import style from "./puzzles.sass";
import { Card, CardTitle, CardText, CardMedia } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

const shuffle = (a: any[]): any[] => {
    for (let i = a.length; i; i--) {
        const j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]]; // eslint-disable-line
    }
    return a;
};

const newArray = (size: number): any[] => Array(size * size)
    .fill()
    .map((it: any, index: number): number => index);

const getColumn = (size: number, index: number): number => parseInt(index % size, 10);
const getRow = (size: number, index: number): number => parseInt(index / size, 10);

const boxSize = 50;
const borderSize = 5;

@installLanguageSets("general", "puzzles")
export default class PuzzleComponent extends Component {

    static propTypes = {
        size: PropTypes.number,
        image: PropTypes.string,
        index: PropTypes.number,
        translate: PropTypes.func,
    }
    static defaultProps = {
        size: 3,
        image: "//lorempixel.com/400/400",
    }

    constructor() {
        super();
        this.state = {
            grid: [],
            blank: { number: -1, index: -1 },
        };
    }
    componentWillMount() {
        this.init(this.props);
    }
    componentWillReceiveProps() {
        this.init(this.props);
    }
    init = (props: Object) => {
        const grid = shuffle(newArray(props.size)).map((it: number, index: number): Object => ({
            number: it,
            index,
        }));
        const blank = grid.find(({ number }: Object): boolean => number === props.size * props.size - 1);
        this.setState({
            grid,
            blank,
        });
    };

    complete = (): boolean => this.state.grid.reduce((prev: boolean, it: Object): boolean => prev && it.index === it.number, true);
    renderGrid = (): Component => {
        const { blank, grid } = this.state;
        const { size, image } = this.props;

        const col = getColumn.bind(getColumn, size);
        const row = getRow.bind(getRow, size);

        const canMove = ((it: Object): boolean => ((dC: number, dR: number): boolean => it.number !== blank.number
                         && dC <= 1
                         && dR <= 1
                         && dR * dC === 0)(
            Math.abs(col(it.index) - col(blank.index)),
            Math.abs(row(it.index) - row(blank.index))
        ));

        return ((wrapperSize: number): Component => (<div
            className={style.grid}
            style={{
                width: wrapperSize,
                height: wrapperSize,
            }}
        >
            <div
                style={{
                    width: wrapperSize,
                    height: wrapperSize,
                    position: "absolute",
                    left: borderSize,
                    top: borderSize,
                    opacity: 0.4,
                    border: `solid 3px ${(this.complete() ? "green" : "red")}`,
                    // background: `url(${image})`,
                    // backgroundSize: `${wrapperSize}px ${wrapperSize}px`,
                }}
            />
            {grid.map(({ number, index }: Object): Component => (<li
                className={[style.box, number === blank.number && style.blank].join(" ")}
                style={{
                    width: boxSize,
                    height: boxSize,
                    margin: borderSize,
                    left: col(index) * (boxSize + borderSize * 2) + borderSize,
                    top: row(index) * (boxSize + borderSize * 2) + borderSize,
                    cursor: canMove({ number, index }) ? "pointer" : "default",
                    ...(image ? {
                        background: `url(${image})`,
                        backgroundSize: `${wrapperSize}px ${wrapperSize}px`,
                        backgroundPosition: `-${((col(number) * (boxSize + borderSize * 2) + borderSize))}px -${((row(number) * (boxSize + borderSize * 2) + borderSize))}px`,
                    } : {}),
                }}
                {...(canMove({ number, index }) ? {
                    onClick: (): void => this.setState({ grid: grid.map((it: Object): boolean =>
                        it.index === blank.index && { ...it, index } ||
                        it.index === index && { ...it, index: blank.index } ||
                        it
                    ), blank: { ...blank, index } }),
                } : {})}
            />))}
        </div>))((boxSize + borderSize * 2) * size);
    }

    render = (): Component => {
        const { expanded } = this.state;
        const { translate, index } = this.props;
        return (<Card className={style.wrapper}>
            <CardTitle className={style.title} title={`${translate("Puzzle")} #${index}`}>
                <div>
                    <Button
                        primary={!this.state.expanded}
                        accent={this.state.expanded}
                        onClick={(): void => ::this.setState({ expanded: !this.state.expanded })}
                    >{this.state.expanded && translate("Hide") || translate("Show")}</Button>
                </div>
            </CardTitle>
            {expanded
                && <CardText className={style.gridWrapper}>{this.renderGrid()}</CardText>
                || <CardMedia
                    aspectRatio="wide"
                    image={this.props.image}
                />
            }
        </Card>);
    }
}
