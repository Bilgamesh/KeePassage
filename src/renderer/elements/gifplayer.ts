import { GifPlayer as GuiGifPlayer, type Image, type ImageScale } from 'gui';
import { View } from '@/renderer/elements/view';

class GifPlayer extends View {
  override node: GuiGifPlayer;
  override name: string = 'gifplayer';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiGifPlayer.create();
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'image':
        this.node.setImage(<Image>value);
        break;
      case 'animating':
        this.node.setAnimating(!!value);
        break;
      case 'scale':
        this.node.setScale(<ImageScale>value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { GifPlayer };
