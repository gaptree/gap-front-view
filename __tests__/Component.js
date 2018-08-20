import {View} from '../index';

class AuthorView extends View {
    template() {
        return this.html`
            <div class="author"><span>${this.props.name}</span>$${'age'}</div>
        `;
    }
}

class DetailView extends View {
    template() {
        return this.html`
            <div class="detail">$${'title'}</div>
        `;
    }
}

// global register
View.regComponent('author-view', AuthorView);

class BookView extends View {
    template() {
        return this.html`
            <div class="book">
                <author-view props=${{'name': 'gap'}} bind-age="age"></author-view>
                <book-detail bind-title="title"></book-detail>
            </div>
        `;
    }

    // local register
    component() { return {'book-detail': DetailView}; }
}

test('component', () => {
    const bookView = new BookView();
    bookView.appendTo(document.body);

    bookView.update({title: 'gap', age: 18});

    const bookAuthorElem = document.querySelector('.book');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="author"><span>gap</span>18</div> <div class="detail">gap</div>');
});
