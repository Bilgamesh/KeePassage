import { Entry as GuiEntry } from 'gui';
import { Entry } from '#/renderer/elements/entry';

class Password extends Entry {
  override name: string = 'password';

  protected override createElement() {
    return GuiEntry.createType('password');
  }
}

export { Password };
