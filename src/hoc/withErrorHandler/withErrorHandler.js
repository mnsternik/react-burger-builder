import React, { Component }  from 'react';
import Aux from '../Auxiliary/Auxiliary';
import Modal from '../../components//UI/Modal/Modal'


//for later: udenerstand this function (why 2 functions?)
//link for course: https://www.udemy.com/course/react-the-complete-guide-incl-redux/learn/lecture/13556518#overview

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends Component {

        state = {
            error: null
        }

        //request and response must be returned 
        componentDidMount() {
            // clear all errors when making new request
            axios.interceptors.request.use(req => {
                this.setState({error: null})
                return req
            })
            axios.interceptors.response.use(res => res, error => {
                this.setState({error: error}); 
            })
        }

        clearErrorHandler = () => {
            this.setState({error: null})
        }
        
        render() {
            return (
                <Aux>
                    <Modal show={this.state.error} close={this.clearErrorHandler}>
                        { this.state.error ? this.state.error.message : null }
                    </Modal>
                    < WrappedComponent {...this.props} />
                </Aux>
            )
        }
    }
}

export default withErrorHandler;