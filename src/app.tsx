import { appearance, type Window } from 'gui';
import { Router } from '#/components/router';
import { Toolbar } from '#/components/toolbar';
import { mainPageIndex, setDark } from '#/data/shared-state';
import { DatabaseIndexPage } from '#/pages/database-index-page';
import { EntryPage } from '#/pages/entry-page';
import { PinentryPage } from '#/pages/pinentry-page';
import { PwGeneratorPage } from '#/pages/pw-generator-page';
import { SettingsPage } from '#/pages/settings-page';
import { TouchPage } from '#/pages/touch-page';
import { WelcomePage } from '#/pages/welcome-page';

function App(props: { window: Window }) {
  appearance.onColorSchemeChange.connect(() =>
    setDark(appearance.isDarkScheme())
  );
  return (
    <>
      <Toolbar window={props.window} />
      <Router selectedPageIndex={mainPageIndex}>
        <WelcomePage window={props.window} />
        <PinentryPage />
        <TouchPage />
        <DatabaseIndexPage window={props.window} />
        <EntryPage />
        <SettingsPage window={props.window} />
        <PwGeneratorPage />
      </Router>
    </>
  );
}

export { App };
