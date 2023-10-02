import { Match, Switch, createSignal, type Component } from 'solid-js';
import Navbar from './components/navbar/Navbar';
import Game from './views/Game';
import Home from './views/Home';

export enum Pages {
  home = "home",
  game = "game"
}

const [page, setOnPage] = createSignal<Pages>(Pages.home)
export function changeView(view: Pages){
  setOnPage(view)
}

const App: Component = () => {

  return <main id='main-app'>
    <Navbar />
    <div class="pt-10">
      <Switch>
        <Match when={page() == Pages.home}>
          <Home />
        </Match>
        <Match when={page() == Pages.game}>
          <Game />
        </Match>
      </Switch>
    </div>

  </main>
};

export default App;
