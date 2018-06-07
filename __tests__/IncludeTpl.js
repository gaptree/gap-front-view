import {View} from '../index';

class BookView extends View {
    template() {
        return this.html`
        <div>
        <span>$${'book.title'}</span>
        <div class="author">
        ${this.html`
            <span>$${'book.author.name'} - $${'book.author.address'}</span>
        `}
        </div>
        </div>
        `;
    }
}

test('include tpl', () => {
    const bookView = new BookView();

    bookView.appendTo(document.body);

    bookView.update({
        book: {
            title: 'Real Analysis,Fourth Edition',
            author: {
                name: 'mike',
                address: 'usa'
            }
        }
    });

    const authorElem = document.querySelector('.author');
    expect(authorElem.innerHTML.trim()).toBe('<span>mike - usa</span>');

    bookView.update({
        book: {
            author: {
                address: 'china'
            }
        }
    });

    expect(authorElem.innerHTML.trim()).toBe('<span>undefined - china</span>');

    bookView.data.book.author.name = 'changed';
    expect(authorElem.innerHTML.trim()).toBe('<span>changed - china</span>');
});
