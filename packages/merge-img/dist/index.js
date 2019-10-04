(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('merge-img'), require('path')) :
    typeof define === 'function' && define.amd ? define(['merge-img', 'path'], factory) :
    (global = global || self, global.main = factory(global.mergeImg, global.path));
}(this, function (mergeImg, path) { 'use strict';

    mergeImg = mergeImg && mergeImg.hasOwnProperty('default') ? mergeImg['default'] : mergeImg;

    async function main() {
        // TODO
        console.log(
          process.arg
        );
        // const paths = [
        //   join(__dirname, '/../images/a.png'),
        //   join(__dirname, '/../images/b.png')
        // ];
        // const image = await mergeImg(paths)
        // image.write('out.png', () => {
        //   console.log('done');
        // });
    }
    main();

    return main;

}));
