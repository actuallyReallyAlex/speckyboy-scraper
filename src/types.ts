import EventEmitter from "events";
import Configstore from "configstore";

/**
 * Application State
 */
export interface AppState {
  config: Configstore;
  menuAction: MenuAction;
  menuActionEmitter: EventEmitter.EventEmitter;
}

export interface Article {
  description: string | undefined;
  imageUrl: string | undefined;
  title: string | undefined;
  url: string | undefined;
}

export type MenuAction = "about" | "exit" | "scrape" | null;
