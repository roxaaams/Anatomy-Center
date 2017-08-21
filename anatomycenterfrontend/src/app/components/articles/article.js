// @flow

import React, { Component, PropTypes } from "react";
import { Link } from "react-router-dom";

import marked from "marked";

import { Tabs, Tab } from "react-toolbox/lib/tabs";

import { hookRequest } from "../../../shared/services/api.js";
import { injectState } from "../../../shared/services/state.js";

import picker from "../../../shared/helpers/picker.js";

import Comments from "../comments/index.js";
import EntertainmentList from "../entertainment/list.js";

import style from "./article.sass";
import { ClassicThreeRenderer, ARThreeRenderer, VRThreeRenderer } from "../viewers";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

@installLanguageSets("gallery", "general")
class Gallery extends Component {
    static propTypes = {
        media: PropTypes.arrayOf(PropTypes.string),
        active: PropTypes.bool,
        translate: PropTypes.func,
    }
    state = {
        active: 0,
    }
    render = (): Component => (<aside className={style.gallery}>
        {this.props.media.map((media: string, index: number): Component => <li className={[style.item, index === this.state.active && style.active].join(" ")} key={index}>
            {index > 0 && <div className={[style.button, style.left].join(" ")} onClick={(): void => this.setState({ active: index - 1 })}>
                <span className="mdi mdi-chevron-left" />
                <div className={style.text}>{this.props.translate("Previous")}</div>
            </div>}
            {media.substr(media.lastIndexOf(".")) === ".stl"
                ? index === this.state.active && <Tabs
                    index={this.state[`model${index}ActiveTab`] || 0}
                    onChange={(activeTab: number): void => this.setState({ [`model${index}ActiveTab`]: activeTab })}
                    className={style.galleryTab}
                >
                    <Tab label={this.props.translate("3D Model")}><ClassicThreeRenderer model={media} /></Tab>
                    <Tab label={(`${this.props.translate("Augmented Reality")} (AR)`)}><ARThreeRenderer model={media} clickHandler={(): void => this.setState({ [`model${index}ActiveTab`]: 0 })} /></Tab>
                    <Tab label={(`${this.props.translate("Virtual Reality")} (VR)`)}><VRThreeRenderer model={media} clickHandler={(): void => this.setState({ [`model${index}ActiveTab`]: 0 })} /></Tab>
                </Tabs> || <h1>{this.props.translate("Rendering")}...</h1>
                : <img src={media} alt="" />
            }
            {index < this.props.media.length - 1 && <div className={[style.button, style.right].join(" ")} onClick={(): void => this.setState({ active: index + 1 })}>
                <span className="mdi mdi-chevron-right" />
                <div className={style.text}>{this.props.translate("Next")}</div>
            </div>}
        </li>)}
    </aside>);
}

@injectState(["language.code"])
@installLanguageSets("article", "content", "puzzles", "general")
@hookRequest([({ id }: { id: string }): Object => ({
    name: "list",
    request: `articles/parent/slug/${id}`,
}), ({ id }: { id: string }): Object => id !== "null" && ({
    name: "articles",
    request: `articles/slug/${id}`,
})], false, false)
export default class ArticleComponent extends Component {
    state = {
        sidebarActive: true,
        galleryActive: false,
        activeTab: 0,
    }

    renderArticle = ({ hasNav, hasGallery, article, code, galleryActive, sidebarActive, activeTab, back, translate }: Object): Component => (<section className={style.content}>
        <header className={[style.header, galleryActive && style.galleryActive, !hasGallery && style.mini].join(" ")}>
            <nav className={[style.nav, style.left].join(" ")}>
                <a onClick={back} className={style.button}>
                    <span className={"mdi mdi-chevron-left"} />
                    <span className={style.text}>{article.parent ? picker(article.parent.names, code).name : translate("Home")}</span>
                </a>
            </nav>
            {(hasNav || hasGallery) && <nav className={[style.nav, style.right].join(" ")}>
                {hasGallery && <a className={style.button} onClick={(): void => this.setState({ galleryActive: !galleryActive })}>
                    <span className={"mdi mdi-image"} />
                    <span className={style.text}>{translate("Gallery")}</span>
                </a>}
                {hasNav && <a className={style.button} onClick={(): void => this.setState({ sidebarActive: !sidebarActive })}>
                    <span className={"mdi mdi-page-layout-sidebar-right"} />
                    <span className={style.text}>{translate("Sidebar")}</span>
                </a>}
            </nav>}
            <Gallery media={article.media} />
            <h1>{picker(article.names, code).name}</h1>
        </header>
        <section className={style.mainContent}>
            <Tabs index={activeTab} onChange={(index: string): void => this.setState({ activeTab: index })} className={style.tabs}>
                <Tab label={translate("Content")}>
                    <div dangerouslySetInnerHTML={{ __html: marked(picker(article.descriptions, code).description) }} />
                </Tab>
                <Tab label={translate("Discussion")}>
                    {article && <Comments id={article._id} />}
                </Tab>
                <Tab label={translate("Puzzles")}>
                    <Tabs index={this.state.activePuzzleTab} onChange={(index: string): void => this.setState({ activePuzzleTab: index })} className={style.tabs}>
                        <Tab label={translate("Questions")}>
                            <EntertainmentList type="questions" article={picker(article.slugs, code).slug} />
                        </Tab>
                        <Tab label={translate("Match Object Puzzles")}>
                            <EntertainmentList type="matchedobjects" article={picker(article.slugs, code).slug} />
                        </Tab>
                        <Tab label={translate("Missing Words Puzzles")}>
                            <EntertainmentList type="missingwords" article={picker(article.slugs, code).slug} />
                        </Tab>
                        <Tab label={translate("Image Puzzles")}>
                            <EntertainmentList type="puzzles" article={picker(article.slugs, code).slug} />
                        </Tab>
                    </Tabs>
                </Tab>
            </Tabs>
        </section>
    </section>)

    render = (): Component => {
        const { articles, id, list, state: { language: { code: code } }, back, translate } = this.props;
        const { sidebarActive, galleryActive, activeTab } = this.state;

        const article = articles && articles[0];

        const hasNav = list && list.length > 0;
        const hasGallery = article && article.media.length > 0;

        return (<article className={style.container}>
            {id !== "null"
                ? article
                    && this.renderArticle({ hasNav, hasGallery, article, code, galleryActive, sidebarActive, activeTab, back, translate })
                    || <section className={style.content}><h1>{translate("Loading")}...</h1></section>
                : <section className={style.content}>
                    <img src="/assets/spash.jpg" alt="" />
                    <h1>Splash Screen</h1>
                </section>}
            {list && list.length > 0 && <nav className={[style.sidenav, (sidebarActive || id === "null") && style.active].join(" ")}>
                {list.map(({ names, media, slugs }: Object): Component => <Link to={`/${picker(slugs, code).slug}`} className={[style.item, media && media.length > 0 && style.media].join(" ")}>
                    {media.length > 0 && <div className={style.galery}>
                        <img src={media[parseInt(Math.random() * media.length, 10)]} alt="" />
                    </div>}
                    <h1>{picker(names, code).name}</h1>
                </Link>)}
            </nav>}
        </article>);
    }
}
