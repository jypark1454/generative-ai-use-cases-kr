import pptxgen from 'pptxgenjs';

export interface SlideContent {
  type: 'title' | 'content';
  title?: string;
  content?: string[];
}

export class PresentationConverter {
  private pres: pptxgen;

  constructor() {
    this.pres = new pptxgen();
  }

  /**
   * タイトルスライドの作成
   */
  private createTitleSlide(content: SlideContent) {
    const slide = this.pres.addSlide();

    if (content.title) {
      slide.addText(content.title, {
        x: 1,
        y: 2,
        w: '80%',
        h: 1,
        fontSize: 44,
        color: '363636',
        align: 'center',
        bold: true,
      });
    }

    if (content.content && content.content.length > 0) {
      slide.addText(content.content[0], {
        x: 1,
        y: 3.2,
        w: '80%',
        h: 0.5,
        fontSize: 24,
        color: '666666',
        align: 'center',
      });
    }
  }

  /**
   * コンテンツスライドの作成
   */
  private createContentSlide(content: SlideContent) {
    const slide = this.pres.addSlide();

    if (content.title) {
      slide.addText(content.title, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 0.8,
        fontSize: 32,
        color: '363636',
        bold: true,
      });
    }

    if (content.content) {
      content.content.forEach((point, index) => {
        const isCode = point.startsWith('[Code]');
        if (isCode) {
          // コードブロックの特別な処理
          const code = point.replace('[Code]', '').trim();
          slide.addText(code, {
            x: 0.7,
            y: 1.5 + index * 0.7,
            w: '85%',
            h: '85%',
            fontSize: 16,
            color: '363636',
            fontFace: 'Courier New',
            fill: { color: 'F5F5F5' },
            line: { color: 'CCCCCC', width: 1 },
          });
        } else {
          // 通常のテキスト
          slide.addText(point, {
            x: 0.7,
            y: 1.5 + index * 0.7,
            w: '85%',
            h: 0.5,
            fontSize: 24,
            color: '363636',
            bullet: true,
          });
        }
      });
    }
  }

  /**
   * RevealのDOMからPPTXへの変換
   */
  public async convertFromRevealDOM(container: HTMLElement): Promise<void> {
    const slides: SlideContent[] = [];
    const slideElements = container.querySelectorAll('.slides section');

    slideElements.forEach((slideElement) => {
      const content: SlideContent = { type: 'content' };
      const contentItems: string[] = [];

      // テキストコンテンツの収集
      slideElement
        .querySelectorAll('h1, h2, h3, li, p, pre code')
        .forEach((element) => {
          if (element.tagName === 'H1') {
            content.type = 'title';
            content.title = element.textContent || '';
          } else if (element.tagName === 'H2' || element.tagName === 'H3') {
            content.type = 'content';
            content.title = element.textContent || '';
          } else if (element.tagName === 'LI' || element.tagName === 'P') {
            contentItems.push(element.textContent || '');
          } else if (element.tagName === 'CODE') {
            contentItems.push(`[Code]${element.textContent || ''}`);
          }
        });

      if (contentItems.length > 0) {
        content.content = contentItems;
      }

      slides.push(content);
    });

    this.pres.defineLayout({
      name: 'CUSTOM',
      width: 10,
      height: 5.625,
    });
    this.pres.layout = 'CUSTOM';

    slides.forEach((slide) => {
      if (slide.type === 'title') {
        this.createTitleSlide(slide);
      } else {
        this.createContentSlide(slide);
      }
    });

    await this.pres.writeFile({ fileName: 'presentation.pptx' });
  }
}
