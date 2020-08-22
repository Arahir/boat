import {getTotalPrice} from './server';
import { makeDescription } from './fixtures';
import { getNextDay, formatDate } from './date';


describe('getTotalPrice', () => {
  it('should throw if start period is after end period', () => {
    const description = makeDescription();
    const from = new Date();
    const to = getNextDay(from);
    description.billingPeriod = {fromDate: to, toDate: from}
    
    expect(() => getTotalPrice(description)).toThrow()
  })
})