import React, { Component } from 'react';
import FaqItem from './FaqItem';
import PropTypes from 'prop-types';

class Faqs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
        };
    }

    updateSearch(event) {
        this.setState({ search: event.target.value.substr(0, 20) });
    }

    render() {
        let filteredFaqs = this.props.faqs.filter(faq => {
            let searchable = faq.question.toLowerCase();
            return searchable.indexOf(this.state.search) !== -1;
        });
        return (
            <div>
                <form style={{ display: 'flex' }}>
                    <input
                        type="text"
                        value={this.state.search.toLowerCase()}
                        onChange={this.updateSearch.bind(this)}
                        style={{ flex: '10', padding: '5px' }}
                        placeholder="Search for an FAQ..."
                    />
                </form>

                {filteredFaqs.map(faq => {
                    return (
                        <FaqItem
                            key={faq.id}
                            faq={faq}
                            question={faq.question}
                            answer={faq.answer}
                        />
                    );
                })}
            </div>
        );
    }
}

// PropTypes
Faqs.propTypes = {
    faqs: PropTypes.array.isRequired,
};

export default Faqs;
