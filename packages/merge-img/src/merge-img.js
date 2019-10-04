import mergeImg from 'merge-img';
import { join } from 'path';

export default async function main() {
    const paths = [
      join(__dirname, '/../images/a.png'),
      join(__dirname, '/../images/b.png')
    ];
    const image = await mergeImg(paths)
    image.write('out.png', () => {
      console.log('done');
    });
}
main();