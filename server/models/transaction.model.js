const { execute, query } = require("../utils/db");

// constructor
const Transaction = function (transaction) {
  const currentDate = new Date();
  this.agent_id = transaction["agentId"];
  this.user_id = transaction["userId"];
  this.trans_date = Math.floor(currentDate.getTime() / 1000);
  this.action = transaction["action"];
  this.round_id = transaction["roundId"];
  this.bet_id = transaction["txnId"];
  this.bet_amount = transaction["betAmount"] || 0.0;
  this.win_amount = transaction["payoutAmount"] || 0.0;
  this.game_code = transaction["gameCode"];
  this.is_feature = transaction["isFeature"];
  this.is_feature_buy = transaction["isFeatureBuy"];
  this.create_date = currentDate;
  this.update_date = currentDate;
  this.percent_user_commission = transaction["percent_user_commission"] || 0.0;
  this.percent_agent_share = transaction["percent_agent_share"] || 0.0;
  this.percent_agent_commission_share =
    transaction["percent_agent_commission_share"] || 0.0;
};

Transaction.create = (transaction) => {
  return new Promise((resolve, reject) => {
    execute(
      `INSERT INTO amb_918kiss_transaction SET ?`,
      transaction,
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve({ id: res.insertId, ...transaction });
      }
    );
  });
};

Transaction.countActionBetAndSettleByBetId = (agentId, betId) => {
  return new Promise((resolve, reject) => {
    query(
      `SELECT count(1) AS Count FROM amb_918kiss_transaction WHERE bet_id = ? AND (action = 'bet_and_settle' OR action = 'settle')`,
      [betId],
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res[0].Count);
      }
    );
  });
};

Transaction.getActionBetByRoundId = (roundId) => {
  return new Promise((resolve, reject) => {
    query(
      `SELECT round_id, bet_amount FROM amb_918kiss_transaction WHERE round_id = ? AND action = 'bet'`,
      [roundId],
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res[0]);
      }
    );
  });
};

Transaction.getTransactionByRoundId = (roundId) => {
  return new Promise((resolve, reject) => {
    query(
      `SELECT bet_id, round_id, bet_amount, win_amount, action FROM amb_918kiss_transaction WHERE round_id = ?`,
      [roundId],
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      }
    );
  });
};

module.exports = Transaction;
