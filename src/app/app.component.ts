import { Component, OnInit } from '@angular/core';
import { Subject, of, Observable, timer } from 'rxjs';
import { flatMap, switchMap, take } from 'rxjs/operators';
import { BullyserviceService } from './bullyservice.service';
import { PushNotificationsService} from 'ng-push';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  name: string;
  character: string;
  lastUpdated: string;
  mute = false;
  status = 'No search started yet';
  observer: any;
  searching = false;

  private searchTrigger$: Subject<string> = new Subject<string>();

  constructor(private bully: BullyserviceService, private pushNotifications: PushNotificationsService) {
    this.pushNotifications.requestPermission();
  }

  ngOnInit(): void {
    this.pushNotifications.requestPermission();
    this.searchPipe()
      .subscribe((page) => {
        this.domParser(page);
      });
  }

  onSearch(): void {
    this.searching = true;
    this.observer = timer(0, 3000)
      .subscribe(() => {
        this.searchTrigger$.next(this.name);
      });
  }

  stopSearch(): void {
    this.searching = false;
    this.observer.unsubscribe();
  }

  searchPipe(): Observable<any> {
    return this.searchTrigger$.pipe(
      flatMap((name) => this.stringToFormData(name)),
      switchMap((formData) => this.bully.getCharacterPage(formData),
    ));
  }

  stringToFormData(name: string): Observable<FormData> {
    const formData = new FormData();
    formData.append('name', name);
    return of(formData);
  }

  domParser(page: string): void {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(page, 'text/html');
    const online = htmlDocument.querySelector('.green');
    const characterName = this.getCharacterName(online);
    this.sendNotification(characterName);
    this.updateStatus(online, characterName);
    this.updateStyles(online);
    this.lastUpdated = new Date(Date.now()).toLocaleString();
  }

  getCharacterName(element: Element): string {
    try {
      const name = element.parentNode.parentNode.querySelector('td').querySelector('nobr').innerHTML;
      const arr = name.split('&nbsp;');
      arr.splice(0, 1).join(' ');
      return arr.join(' ');
    } catch {
      return undefined;
    }
  }

  sendNotification(characterName: string): void {
    const isSameAsLast = isEqual(this.character, characterName);
    this.character = characterName;
    if (!isSameAsLast && this.character) {
      this.notify();
    }
  }

  updateStatus(online: any, characterName: string): void {
    this.status = online
      ? 'User is online with character: '
      + characterName
      : 'No online characters found for this user';
  }

  updateStyles(online: any): void {
    const status: HTMLElement = document.querySelector('.status') as HTMLElement;
    if (online) {
      status.classList.add('success');
      status.classList.remove('not-found');
    } else {
      status.classList.add('not-found');
      status.classList.remove('success');
    }
  }

  notify() {
    const options = {
      body: 'Get fucked, ' + this.character + '.',
      icon: 'assets/spurdo.jpg'
    };
    this.pushNotifications.create('User found online!', options)
      .pipe(take(1))
      .subscribe(() => {
        if (!this.mute) {
          this.playAudio();
        }
      });
  }

  playAudio() {
    const audio = new Audio();
    audio.src = 'assets/when.mp3';
    audio.volume = 0.2;
    audio.load();
    audio.play();
  }

  muteAudio(e: any): void {
    e.preventDefault();
    this.mute = !this.mute;
    const speaker = document.querySelector('.speaker').classList;
    this.mute
      ? speaker.add('mute')
      : speaker.remove('mute');
  }
}


