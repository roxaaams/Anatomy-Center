import React, { Component, PropTypes, createElement } from "react";
import { hookRequest } from "../../../shared/services/api.js";

import QuestionsComponent from "./questions.js";
import PuzzlesComponent from "./puzzles.js";
import MatchObject from "./matchobject.js";

const componentMap = {
    questions: QuestionsComponent,
    puzzles: PuzzlesComponent,
    matchedobjects: MatchObject,
    missingwords: MatchObject,
};
import { installLanguageSets } from "../../../shared/translation/decorators.js";

@installLanguageSets("general", "entertainment", "puzzles")
@hookRequest([({ article, type }: Object): Object => ({
    name: "ids",
    request: `articles/slug/${article}/${type}.ids`,
})], false, false)
export default class EntertainmentListComponent extends Component { // eslint-disable-line
    static propTypes = {
        article: PropTypes.string,
        type: PropTypes.string,
        ids: PropTypes.arrayOf(PropTypes.string),
        translate: PropTypes.func,
    }

    render = (): Component => <div
        style={{
            width: "100%",
            height: "100%",
            overflowX: "hidden",
            overflowY: "auto",
        }}
    >
        {this.props.ids &&
            this.props.ids.length > 0 &&
                componentMap[this.props.type]
                    ? this.props.ids.map((id: string, index: number): Component =>
                        createElement(
                            componentMap[this.props.type],
                            { id, index, type: this.props.type }
                        )
                    )
                    : <h1>{this.props.translate("No renderer available for the")} {this.props.translate(this.props.type)} {this.props.translate("puzzle type")}.</h1>
            || <h1>{this.props.translate("There are no")} {this.props.translate(this.props.type)} {this.props.translate("for this article")}.</h1>
        || <h1>{this.props.translate("Loading")} {this.props.type}...</h1>}
    </div>
}
