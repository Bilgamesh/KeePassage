import { appearance, type Window } from 'gui';
import { setDark } from '#/data/shared-state';
import { Navigator, Router } from '#/views/components/router';
import { Toolbar } from '#/views/components/toolbar';
import { DatabaseIndexPage } from '#/views/pages/database-index';
import { EntryPage } from '#/views/pages/entry';
import { PinentryPage } from '#/views/pages/pinentry';
import { PwGeneratorPage } from '#/views/pages/pw-generator';
import { SettingsPage } from '#/views/pages/settings';
import { TouchPage } from '#/views/pages/touch';
import { WelcomePage } from '#/views/pages/welcome';

const navigator = new Navigator({
  WELCOME: 0,
  PINTENTRY: 1,
  TOUCH: 2,
  DB_INDEX: 3,
  ENTRY: 4,
  SETTINGS: 5,
  GENERATOR: 6
});

function App(props: { window: Window }) {
  appearance.onColorSchemeChange.connect(() =>
    setDark(appearance.isDarkScheme())
  );
  return (
    <>
      <Toolbar window={props.window} />
      <Router navigator={navigator}>
        <WelcomePage window={props.window} />
        <PinentryPage navigator={navigator} window={props.window} />
        <TouchPage window={props.window} />
        <DatabaseIndexPage window={props.window} />
        <EntryPage />
        <SettingsPage window={props.window} />
        <PwGeneratorPage />
      </Router>
    </>
  );
}

export { App, navigator };
