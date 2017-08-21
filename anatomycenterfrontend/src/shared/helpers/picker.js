// @flow

export default (list: Object[], language: string): Object =>
    list.find((item: Object): boolean => item.lng === language) || list[0];
