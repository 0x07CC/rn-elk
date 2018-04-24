import React from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActionSheetIOS
} from 'react-native';

import fx from 'money';
import _ from 'lodash';

import GestureRecognizer from 'react-native-swipe-gestures';

import rates from './rates';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.disableYellowBox = true;

    fx.rates = rates.rates;
    fx.base = rates.base;

    this.state = {
      from: 'USD',
      to: 'GBP',
      multiple: 1,
      active: -1
    }
  }

  changeCurrency = (side) => {
    let options = Object.keys(rates.rates);
    
    ActionSheetIOS.showActionSheetWithOptions({
      options
    }, index => this.setState({
      [side]: options[index]
    }));
  }

  onSwipeLeft = () => {
    let {multiple} = this.state;

    this.setState({
      multiple: multiple / 10
    });
  }

  onSwipeRight = () => {
    let {multiple} = this.state;

    this.setState({
      multiple: multiple * 10
    });
  }

  renderRate = (base, conv) => {
    return (
      <View style={styles.row} key={base}>
        <Text style={styles.rate}>{base.toFixed(2)}</Text>
        <Text style={styles.rate}>{conv.toFixed(2)}</Text>
      </View>
    )
  }

  renderChart = () => {
    let base = this.state.active * this.state.multiple;

    return (
      <View style={styles.chart}>
        {_.range(0.1 * this.state.multiple, this.state.multiple, 0.1 * this.state.multiple).map(d => {
          let conv = fx.convert(base + d, {
            from,
            to
          } = this.state);

          return this.renderRate(base + d, conv);
        })}
      </View>
    )
  }
  
  renderRow = (info) => {
    let conv = fx.convert(info * this.state.multiple, {
      from,
      to
    } = this.state);

    return (
      <TouchableOpacity key={info} onPress={() => this.setState({
        active: info
      })}>
        {this.renderRate(info * this.state.multiple, conv)}
        {this.state.active == info && this.renderChart()}
      </TouchableOpacity>
    )
  }
  
  render() {
    return (
      <ScrollView>
        <View style={styles.row}>
          <TouchableOpacity style={styles.rate} onPress={() => this.changeCurrency('from')}>
            <Text>{this.state.from}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rate} onPress={() => this.changeCurrency('to')}>
            <Text>{this.state.to}</Text>
          </TouchableOpacity>
        </View>
        
        <GestureRecognizer style={styles.container}
          onSwipeLeft={this.onSwipeLeft}
          onSwipeRight={this.onSwipeRight}
        >
          {_.times(10, i => this.renderRow(i + 1))}
        </GestureRecognizer>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    height: Dimensions.get('window').height / 10
  },
  rate: {
    flex: 1,
    width: '50%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chart: {
    backgroundColor: '#F5F5FF'
  }
});
