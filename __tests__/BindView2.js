import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
        <div class="user-view">$${'name'} - $${'address'}</div>
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
            <div class="author">
                $${'book.author.name'} - $${'book.author.address'}
            </div>
            </div>
        </div>
        `;
    }
}

/*
 * {
 *  book: {
 *      title: "book title",
 *      author: {
 *          name: 'author name',
 *          address: 'author address'
 *      }
 *  }
 * }
 */

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
    const userViewElem = document.querySelector('.book-author .user-view');
    const authorElem = document.querySelector('.book-author .author');

    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(userViewElem.innerHTML.trim()).toBe('jack - yk');
    expect(authorElem.innerHTML.trim()).toBe('jack - yk');

    bookView.data.book.author = {
        name: 'mike',
        address: 'sh'
    };
    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(userViewElem.innerHTML.trim()).toBe('mike - sh');
    expect(authorElem.innerHTML.trim()).toBe('mike - sh');

    bookView.data.book.author.name = 'tom';
    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(userViewElem.innerHTML.trim()).toBe('tom - sh');
    expect(authorElem.innerHTML.trim()).toBe('tom - sh');

    bookView.userView.update({
        name: 'rose',
        address: 'zj'
    });
    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(userViewElem.innerHTML.trim()).toBe('rose - zj');
    expect(authorElem.innerHTML.trim()).toBe('rose - zj');

    bookView.userView.data.address = 'fz';
    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(userViewElem.innerHTML.trim()).toBe('rose - fz');
    expect(authorElem.innerHTML.trim()).toBe('rose - fz');
});
