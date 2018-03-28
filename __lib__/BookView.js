import {P} from '../index.js';
import {AuthorView} from './AuthorView.js';

export class BookView extends P
{
    render() {
        this.ctn.html`
            <span class="user">
            ${this.view('author', AuthorView, {name: 'miao'})}
            </span>
        `;
    }

    onUpdate() {
        this.get('author').update({name: 'haha'});
    }
}
