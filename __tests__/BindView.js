import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
        <div class="user">$${'name'} - $${'address'}</div>
        `;
    }
}

class BookView extends View {
    template() {
        return this.html`
        <div>
            <span class="book-title">$${'book.title'}</span>
            <div class="book-author">
            <gap-view
                view=${new UserView()}
                bind="book.author"
            />
            </div>
        </div>
        `;
    }

    setAuthor(author) {
        this.data.book.author = author;
    }

    setAuthorName(name) {
        this.data.book.author.name = name;
    }
}

test('bind view', () => {
    const bookView = new BookView();
    bookView.appendTo(document.body);

    bookView.update({
        book: {
            title: 'time history',
            author: {
                name: 'jack',
                address: 'yk'
            }
        }
    });

    const bookTitleElem = document.querySelector('.book-title');
    const bookAuthorElem = document.querySelector('.book-author');

    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">jack - yk</div>');

    bookView.setAuthor({
        name: 'mike',
        address: 'sh'
    });

    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">mike - sh</div>');

    bookView.setAuthorName('tom');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">tom - sh</div>');
});
