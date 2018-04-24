import React from 'react';

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActionSheetIOS
} from 'react-native';

import GestureRecognizer from 'react-native-swipe-gestures';

import _ from 'lodash';
import fx from 'money';

import rates from './rates';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.disableYellowBox = true;
    
    fx.rates = rates.rates;
    fx.base = rates.base;

    this.state = {
      multiplier: 1,
      expanded: -1,
      from: 'USD',
      to: 'GBP'
    }
  }

  promptCurrency = (side) => {
    let options = Object.keys(fx.rates);

    ActionSheetIOS.showActionSheetWithOptions({
      options
    }, select => 
      this.setState({
        [side]: options[select]
      })
    );
  }

  onSwipeLeft = () => {
    let {multiplier} = this.state;
    
    if (multiplier > 1)
      this.setState({
        multiplier: multiplier / 10
      });
  }

  onSwipeRight = () => {
    let {multiplier} = this.state;
    
    this.setState({
      multiplier: multiplier * 10
    });
  }

  renderRate = (base, conv) => {
    return (
      <View style={styles.column} key={base}>
        <Text style={styles.cell}>{base.toFixed(2)}</Text>
        <Text style={styles.cell}>{conv.toFixed(2)}</Text>
      </View>
    )
  }

  renderDecimalChart = () => {
    let base = (this.state.expanded + 1) * this.state.multiplier,
        lBound = 0.1 * this.state.multiplier;
    
    return (
      <View style={styles.decChart}>
        {_.range(lBound, this.state.multiplier, lBound).map(d => {
          let conv = fx.convert(base + d, {
            from,
            to
          } = this.state);

          return this.renderRate(base + d, conv);
        })}
      </View>
    )
  }

  renderCell = (info, index) => {
    let conv = fx.convert(info * this.state.multiplier, {
      from,
      to
    } = this.state);

    return (
      <TouchableOpacity
        key={index}
        
        onPress={() => this.setState({
          expanded: this.state.expanded == index ? -1 : index
        })}
      >
        {this.renderRate(info, conv)}
        {this.state.expanded == index && this.renderDecimalChart()}
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <ScrollView>
        <GestureRecognizer style={styles.container}
          onSwipeLeft={this.onSwipeLeft}
          onSwipeRight={this.onSwipeRight}
        >
          <View style={styles.column} key={0}>
            <TouchableOpacity style={styles.cell} onPress={() => this.promptCurrency('from')}>
              <Text>{this.state.from}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cell} onPress={() => this.promptCurrency('to')}>
              <Text>{this.state.to}</Text>
            </TouchableOpacity>
          </View>

          {_.times(10, i => this.renderCell((i + 1) * this.state.multiplier, i + 1))}
        </GestureRecognizer>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22
  },
  column: {
    flex: 1,
    height: Dimensions.get('window').height / 10,
    flexDirection: 'row'
  },
  decChart: {
    backgroundColor: '#F5FCFF',
  },
  cell: {
    flex: 1,
    width: '50%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
