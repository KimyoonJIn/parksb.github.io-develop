import * as ejs from 'ejs';
import * as fs from 'fs';
import * as highlightJs from 'highlight.js';
import * as md from 'markdown-it';
import * as path from 'path';

import ArticleListPublisher from './ArticleListPublisher';
import ArticleMetaInfo from './classes/ArticleMetaInfo';
import Article from './classes/Article';
import ArticleModel from './models/ArticleModel';

class ArticlePublisher {
  static ARTICLE_ORIGIN_PATH: string = path.join(__dirname, '../_articles');
  static ARTICLE_DIST_PATH: string = path.join(__dirname, '../app/article');
  static ARTICLE_TEMPLATE: Buffer = fs.readFileSync(path.join(__dirname, '../app/templates/article-template.html'));

  static md: md = new md({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: (str, lang) => {
      if (lang && highlightJs.getLanguage(lang)) {
        return `<pre class="hljs"><code>${highlightJs.highlight(lang, str, true).value}</code></pre>`;
      }
      return `<pre class="hljs"><code>${ArticlePublisher.md.utils.escapeHtml(str)}</code></pre>`;
    },
  });

  private static extractContent(text: string): string {
    return text.replace(/(-{3})([\s\S]+?)(\1)/, '');
  }

  private static extractMetaInfo(text: string): ArticleMetaInfo {
    const metaInfo: ArticleMetaInfo = new ArticleMetaInfo();
    const metaInfoLines: string[] = text.match(/(-{3})([\s\S]+?)(\1)/)[2]
      .match(/[^\r\n]+/g);

    if (!metaInfoLines) {
      return null;
    }

    metaInfoLines.forEach((metaInfoLine: string) => {
      const kvp: string[] = metaInfoLine.match(/(.+?):(.+)/);

      if (kvp) {
        const key: string = kvp[1].replace(/\s/g, '');
        const value: string = kvp[2].replace(/['"]/g, '').trim();

        metaInfo.setProp(key, value);
      }
    });

    return metaInfo;
  }

  public static publishAllArticles() {
    const articleFiles: string[] = fs.readdirSync(this.ARTICLE_ORIGIN_PATH);

    const distArticles: ArticleModel[] = articleFiles.map((articleFile: string) => {
      const mdContent: Buffer = fs.readFileSync(`${this.ARTICLE_ORIGIN_PATH}/${articleFile}`);
      const htmlContent: string = this.md.render(this.extractContent(String(mdContent)));
      const metaInfo: ArticleMetaInfo = this.extractMetaInfo(String(mdContent));

      const article: Article = new Article({
        id: metaInfo.getId(),
        title: metaInfo.getTitle(),
        subtitle: metaInfo.getSubtitle(),
        date: metaInfo.getDate(),
        tags: metaInfo.getTags(),
        content: htmlContent,
      });

      fs.writeFileSync(
        `${this.ARTICLE_DIST_PATH}/${metaInfo.getId()}.html`,
        ejs.render(String(this.ARTICLE_TEMPLATE), article.getArticle()),
      );

      console.log(`* ${metaInfo.getId()}: ${metaInfo.getTitle()}`);
      return article.getArticle();
    });

    ArticleListPublisher.publishArticleList(distArticles);
  }

  public static publishArticle(id: number) {
    const articleFiles: string[] = fs.readdirSync(this.ARTICLE_ORIGIN_PATH);

    const distArticles: ArticleModel[] = articleFiles.map((articleFile: string) => {
      const mdContent: Buffer = fs.readFileSync(`${this.ARTICLE_ORIGIN_PATH}/${articleFile}`);
      const htmlContent: string = this.md.render(this.extractContent(String(mdContent)));
      const metaInfo: ArticleMetaInfo = this.extractMetaInfo(String(mdContent));

      const article: Article = new Article({
        id: metaInfo.getId(),
        title: metaInfo.getTitle(),
        subtitle: metaInfo.getSubtitle(),
        date: metaInfo.getDate(),
        tags: metaInfo.getTags(),
        content: htmlContent,
      });

      if (metaInfo.getId() === id) {
        console.log(`* ${metaInfo.getId()}: ${metaInfo.getTitle()}`);
        fs.writeFileSync(
          `${this.ARTICLE_DIST_PATH}/${metaInfo.getId()}.html`,
          ejs.render(String(this.ARTICLE_TEMPLATE), article.getArticle()),
        );
      }

      return article.getArticle();
    });

    ArticleListPublisher.publishArticleList(distArticles);
  }
}

export default ArticlePublisher;
