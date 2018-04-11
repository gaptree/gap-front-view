import {View} from '../index.js';

export class AuthorView extends View
{
    static get tag() { return 'strong'; }

    handleUpdate() {
        this.render();
    }

    render() {
        this.ctn.html`
            ${this.data.name}
        `;
    }
}
