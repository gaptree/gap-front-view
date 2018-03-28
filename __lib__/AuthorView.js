import {View} from '../index.js';

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
