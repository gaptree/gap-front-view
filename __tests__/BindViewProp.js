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
                ref=${view => this.userView = view}
                view=${new UserView()}
                bind-name="book.author.name"
                bind-address="book.author.address"
            ></gap-view>
            </div>
        </div>
        `;
    }
}

test('bind view prop', () => {
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

    bookView.data.book.author = {
        name: 'mike',
        address: 'sh'
    };

    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">mike - sh</div>');

    bookView.userView.data.name = 'tom';
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">tom - sh</div>');

    bookView.data.book.author = {
        name: 'tom-changed',
        address: 'sh-changed'
    };
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">tom-changed - sh-changed</div>');
});
