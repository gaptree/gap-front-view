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
                bind="book.author"
            ></gap-view>
            </div>
        </div>
        `;
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
    const userElem = document.querySelector('.book-author .user');

    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(userElem.innerHTML.trim()).toBe('-');

    bookView.data.book.author = {
        name: 'mike',
        address: 'sh'
    };

    expect(userElem.innerHTML.trim()).toBe('mike - sh');

    bookView.userView.data.name = 'tom';
    expect(userElem.innerHTML.trim()).toBe('tom - sh');
});
