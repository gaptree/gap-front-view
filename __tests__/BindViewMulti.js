import {View} from '../index';

class CoverView extends View {
    template() {
        return this.html`
        <div class="cover">
            $${'title'} - $${'author.name'} - $${'author.address'}
        </div>
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
                ref=${view => this.coverView = view}
                view=${new CoverView()}
                bind-multi=${{title: 'book.title', 'author.name': 'book.author.name', 'author.address': 'book.author.address'}}
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
    const coverElem = document.querySelector('.cover');

    expect(bookTitleElem.innerHTML.trim()).toBe('time history');
    expect(coverElem.innerHTML.trim()).toBe('time history - jack - yk');

    bookView.data.book.author = {
        name: 'mike',
        address: 'sh'
    };

    expect(coverElem.innerHTML.trim()).toBe('time history - mike - sh');

    bookView.coverView.data.author.name = 'tom';
    expect(coverElem.innerHTML.trim()).toBe('time history - tom - sh');

    bookView.data.book.author = {
        name: 'tom-changed',
        address: 'sh-changed'
    };
    expect(coverElem.innerHTML.trim()).toBe('time history - tom-changed - sh-changed');

    bookView.coverView.data.title = 'future history';
    expect(coverElem.innerHTML.trim()).toBe('future history - tom-changed - sh-changed');
    expect(bookTitleElem.innerHTML.trim()).toBe('future history');
});
