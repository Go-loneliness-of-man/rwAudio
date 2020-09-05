<script>

export default {

  methods: {
    supplyDefault(params, defaultObj) {
      defaultObj = defaultObj();
      for(let k in defaultObj)
        params[k] = params[k] ? params[k] : defaultObj[k];
      return params;
    }
  },
};

</script>
