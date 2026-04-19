module.exports = {
  // Minimal Stylelint config to allow Tailwind at-rules
  // Avoids requiring stylelint-config-standard to be installed.
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'tailwind',
        'apply',
        'variants',
        'responsive',
        'screen',
        'layer'
      ]
    }]
  }
}
