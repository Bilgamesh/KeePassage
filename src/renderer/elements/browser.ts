import { View } from '@/renderer/elements/view';
import { Browser as GuiBrowser } from 'gui';

class Browser extends View {
  override node: GuiBrowser;
  override name: string = 'browser';
  private magnifiable = true;

  private disableZoomScript =
    "(function(){document.addEventListener('keydown',function(e)" +
    "{if(e.ctrlKey&&(e.keyCode=='61'||e.keyCode=='107'||e.keyCode=='173'" +
    "||e.keyCode=='109'||e.keyCode=='187'||e.keyCode=='189'))" +
    "{e.preventDefault()}});document.addEventListener('wheel',function(e)" +
    '{if(e.ctrlKey){e.preventDefault()}})})();';

  constructor() {
    super();
    this.node = this.createElement();
    this.updateZoom();
  }

  protected override createElement() {
    return GuiBrowser.create({ allowFileAccessFromFiles: true });
  }

  private updateZoom() {
    // macOS supports disabling zoom out of the box via `node.setMagnifiable(boolean)`. For other OSes, run custom JS to disable zoom
    if (process.platform !== 'darwin') {
      this.node.onChangeLoading.connect(() => {
        if (!this.magnifiable) {
          this.node.executeJavaScript(this.disableZoomScript, () => {});
        }
      });
    }
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'url':
        this.node.loadURL(String(value));
        break;
      case 'html':
        if (typeof value === 'string') {
          this.node.loadHTML(value, 'about:blank');
        } else {
          const { html, baseUrl } = <{ html: string; baseUrl?: string }>value;
          this.node.loadHTML(html, baseUrl || 'about:blank');
        }
        break;
      case 'javaScript':
        const { code, callback } = <{ code: string; callback?: Function }>value;
        this.node.executeJavaScript(code, callback || (() => {}));
        break;
      case 'userAgent':
        this.node.setUserAgent(String(value));
        break;
      case 'magnifiable':
        this.magnifiable = !!value;
        if (process.platform === 'darwin') {
          this.node.setMagnifiable(!!value);
        }
        break;
      case 'onClose':
        this.node.onClose.connect(value);
        break;
      case 'onUpdateCommand':
        this.node.onUpdateCommand.connect(value);
        break;
      case 'onChangeLoading':
        this.node.onChangeLoading.connect(value);
        break;
      case 'onUpdateTitle':
        this.node.onUpdateTitle.connect(value);
        break;
      case 'onStartNavigation':
        this.node.onStartNavigation.connect(value);
        break;
      case 'onCommitNavigation':
        this.node.onCommitNavigation.connect(value);
        break;
      case 'onFinishNavigation':
        this.node.onFinishNavigation.connect(value);
        break;
      case 'onFailNavigation':
        this.node.onFailNavigation.connect(value);
        break;
      default:
        super.setProperty(name, value);
        break;
    }
  }
}

export { Browser };
