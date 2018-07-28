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
                ref=${view => this.userView = view}
                bind="book.author"
                on-change-name=${name => this.changeUserName(name)}
            />
            </div>
        </div>
        `;
    }

    changeUserName(name) {
        this.userView.data.name = name;
    }
}

test('view event', () => {
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
    const bookAuthorElem = document.querySelector('.book-author');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">jack - yk</div>');

    bookView.userView.trigger('change-name', 'changed');

    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">changed - yk</div>');
});
