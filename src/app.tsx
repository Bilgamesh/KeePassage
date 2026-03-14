import { appearance, type Window } from 'gui';
import { pageIndex } from '#/data/navigator';
import { setDark } from '#/data/shared-state';
import { Router } from '#/views/components/router';
import { Toolbar } from '#/views/components/toolbar';
import { DatabaseIndexPage } from '#/views/pages/database-index-page';
import { EntryPage } from '#/views/pages/entry-page';
import { PinentryPage } from '#/views/pages/pinentry-page';
import { PwGeneratorPage } from '#/views/pages/pw-generator-page';
import { SettingsPage } from '#/views/pages/settings-page';
import { TouchPage } from '#/views/pages/touch-page';
import { WelcomePage } from '#/views/pages/welcome-page';

function App(props: { window: Window }) {
  appearance.onColorSchemeChange.connect(() =>
    setDark(appearance.isDarkScheme())
  );
  return (
    <>
      <Toolbar window={props.window} />
      <Router selectedPageIndex={pageIndex}>
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
