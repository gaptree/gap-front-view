import {View} from '../index';

class BookView extends View {
    template() {
        return this.html`
        <div>
        <span class="book-title">$${'book.title'}</span>
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
            title: 'Real Analysis, Fourth Edition',
            author: {
                name: 'mike',
                address: 'usa'
            }
        }
    });

    const authorElem = document.querySelector('.author');
    const bookTitleElem = document.querySelector('.book-title');

    expect(authorElem.innerHTML.trim()).toBe('<span>mike - usa</span>');
    expect(bookTitleElem.innerHTML.trim()).toBe('Real Analysis, Fourth Edition');

    bookView.update({
        book: {
            author: {
                address: 'china'
            }
        }
    });

    expect(authorElem.innerHTML.trim()).toBe('<span> - china</span>');
    expect(bookTitleElem.innerHTML.trim()).toBe('');

    bookView.data.book.author.name = 'changed';
    expect(bookTitleElem.innerHTML.trim()).toBe('');
    expect(authorElem.innerHTML.trim()).toBe('<span>changed - china</span>');
});
