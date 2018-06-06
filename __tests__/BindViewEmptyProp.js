import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
        <div class="user">$${'name'} - $${'address'}</div>
        `;
    }

    setName(name) {
        this.data.name = name;
    }
}

class BookView extends View {
    template() {
        return this.html`
        <div>
            <span class="book-title">$${'book.title'}</span>
            <div class="book-author">
            <gap-view
                ref=${view => this.userView = view}
                view=${new UserView()}
            ></gap-view>
            </div>
        </div>
        `;
    }

    setAuthor(author) {
        this.userView.update(author);
    }

    setAuthorName(name) {
        this.userView.setName(name);
    }
}

test('bind view empty prop', () => {
    const bookView = new BookView();
    bookView.appendTo(document.body);

    bookView.update({
        book: {
            title: 'time history',
        }
    });

    const bookTitleElem = document.querySelector('.book-title');
    const bookAuthorElem = document.querySelector('.book-author');

    expect(bookTitleElem.innerHTML.trim()).toBe('time history');

    bookView.setAuthor({
        name: 'mike',
        address: 'sh'
    });

    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">mike - sh</div>');

    bookView.setAuthorName('tom');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">tom - sh</div>');
});
