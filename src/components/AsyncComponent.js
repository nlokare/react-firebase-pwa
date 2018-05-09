import React, { Component } from "react";

export default function asyncCmponent(getComponent) {
  return class AsyncComponent extends Component {
    constructor(props) {
      super(props);
      this.state = { Component: null};
    }
    componentWillMount() {
      if (!this.state.Component) {
        getComponent().then(Component => {
          this.setState({ Component });
        });
      }
    }

    render() {
      const { Component } = this.state;
      if (Component) {
        return <Component {...this.props} />;
      }
      return null;
    }
  }
}