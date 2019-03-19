export interface SliderConfig {
    readonly defaultValue: number
    , readonly storageKey: string
    , readonly elementID: string
    , readonly feedbackElementID: string
}

export interface Config {
    readonly states: number
    , readonly width: number
    , readonly height: number
    , readonly cellwidth: number
    , readonly numberOfAnts: number
    , readonly anthillID: string
    , readonly antdropperID: string
    , readonly dropperRadius: SliderConfig
    , readonly dropperAmount: SliderConfig
    , readonly antVisibilityID: string;
}


const config: Config = {
    states: 255
    , width: 1200
    , height: 800
    , cellwidth: 2
    , numberOfAnts: 0
    , anthillID: "#layer1-anthill"
    , antdropperID: "#layer2-antdropper"
    , dropperRadius: {
        defaultValue: 5
        , storageKey: "dropper$last_radius"
        , elementID: "#radius"
        , feedbackElementID: "#radius_show"
    }
    , dropperAmount: {
        defaultValue: 1
        , storageKey: "dropper$last_amount"
        , elementID: "#amount"
        , feedbackElementID: "#dropperAmount"
    }
    , antVisibilityID : "#drawAnts"
};

export default config;