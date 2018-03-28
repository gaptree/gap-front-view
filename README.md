# gap-front-view

## Install

```
yarn add gap-front-view
```

## Usage

```html
<div id="container"></div>
```

```javascript
import {View} from 'gap-front-view';

export class AuthorView extends View
{
    static get tag() { return 'strong'; }

    onUpdate() {
        this.render();
    }

    render() {
        this.ctn.html`
            ${this.data.name}
        `;
    }
}
```

```javascript
import {Div} from 'gap-front-view';
import {AuthorView} from './AuthorView.js';

export class BookView extends Div
{
    render() {
        this.ctn.html`
            <span class="user">
            ${this.view('author', AuthorView, {name: 'Gap Tree'})}
            </span>
        `;
    }

    onUpdate() {
        this.get('author').update({name: 'haha'});
    }
}
```

```
import {BookView} from './BookView.js';
import {oneElem} from 'gap-front-web';

const book = new BookView();
book.appendTo(oneElem('#container');
```

Expect Html:

```html
<div id="container">
    <div>
        <span class="user">
            <strong>Gap Tree</strong>
        </span>
    </div>
</div>
```
