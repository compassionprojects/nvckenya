import { marked } from 'marked';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;

// make sure to add target="_blank" for all external links
// https://github.com/markedjs/marked/issues/655#issuecomment-712380889
renderer.link = (href, title, text) => {
  const localLink = href.startsWith(
    typeof window === 'undefined'
      ? process.env.DOMAIN_HOST
      : `${location.protocol}//${location.hostname}`,
  );
  const html = linkRenderer.call(renderer, href, title, text);
  return localLink
    ? html
    : html.replace(
        /^<a /,
        '<a target="_blank" rel="noreferrer noopener nofollow" ',
      );
};

export default function (str) {
  return marked(str, { renderer });
}
